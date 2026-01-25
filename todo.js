const inputedTask = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const listShow = document.getElementById('listShow');
const taskDay = document.getElementById('day-schedule');
const taskTime = document.getElementById('time-input');   // The time picker




// HELPER FUNCTION: This does all the building
function createTaskElement(taskValue, taskDay, taskTime, isCompleted = false) {
   
    

    const listItem = document.createElement('li');
    listItem.className = 'todo-item';
    if (isCompleted) listItem.classList.add('completed');

    const metaContainer = document.createElement('div');
    metaContainer.className = 'task-meta';

    // 1. Check Button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-btn';

    const checkIcon = document.createElement('i');
    checkIcon.setAttribute('data-lucide', isCompleted ? 'check-circle-2' : 'circle');
    checkBtn.appendChild(checkIcon);

    // 2. Text
    const textSpan = document.createElement('span');
    textSpan.textContent = taskValue;
    textSpan.className = 'task-text';

     const dayLabel = document.createElement('span');
    dayLabel.className = 'day-tag'; // Style this in CSS
    dayLabel.textContent = taskDay;

    const timeLabel = document.createElement('span');
    timeLabel.className = 'time-tag';
    timeLabel.setAttribute('data-raw-time', taskTime || "");
    timeLabel.innerHTML = `<i class="fa-regular fa-clock"></i> ${formatTime(taskTime)}`;
    

    // 3. Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

    // Button Logic
    deleteBtn.onclick = () => {
        listItem.remove();
        saveToLocalStorage();
    };

   checkBtn.onclick = () => {
    listItem.classList.toggle('completed');
    const isDone = listItem.classList.contains('completed');
    
    // 1. Find the icon currently inside THIS button (it might be an <i> or an <svg>)
    const currentIcon = checkBtn.querySelector('[data-lucide]');
    
    // 2. Update the attribute
    currentIcon.setAttribute('data-lucide', isDone ? 'check-circle-2' : 'circle');
    
    // 3. Tell Lucide to re-render
    if (window.lucide) {
        lucide.createIcons();
    }
    
    saveToLocalStorage();
};

    metaContainer.appendChild(dayLabel);
    metaContainer.appendChild(timeLabel);

    listItem.appendChild(checkBtn);
    listItem.appendChild(textSpan);
    listItem.appendChild(deleteBtn);
    listItem.appendChild(dayLabel);
    listItem.appendChild(metaContainer);
    
    return listItem;
}

// Remove the old: const taskTime = document.getElementById('time-input');

function addTask(event) {
    event.preventDefault();
    
    const taskValue = inputedTask.value.trim();
    if (taskValue === "") return;

    // Grab the text from the blue 'selected' boxes
    const hour = document.querySelector('#hours-col .selected')?.textContent || "12";
    const min = document.querySelector('#mins-col .selected')?.textContent || "00";
    const ampm = document.querySelector('#ampm-col .selected')?.textContent || "AM";

    const taskData = {
        text: taskValue,
        day: taskDay.value || "Anyday",
        time: `${hour}:${min} ${ampm}`, // This creates "03:15 PM"
        completed: false
    };

    const newTask = createTaskElement(taskData.text, taskData.day, taskData.time, taskData.completed);
    listShow.appendChild(newTask);

    saveToLocalStorage();
    lucide.createIcons();
    inputedTask.value = "";
    inputedTask.focus();
}
function saveToLocalStorage() {
    const tasks = [];
    document.querySelectorAll('.todo-item').forEach(item => {
        const timeTag = item.querySelector('.time-tag');
        
        tasks.push({
            text: item.querySelector('.task-text').textContent,
            day: item.querySelector('.day-tag').textContent,
            // FIX: Grab the raw 24-hour time, not the formatted text!
            time: timeTag ? timeTag.getAttribute('data-raw-time') : "",
            completed: item.classList.contains('completed')
        });
    });
    localStorage.setItem('coyTasks', JSON.stringify(tasks));
}
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('coyTasks');
    if (!savedData) return;

    const tasks = JSON.parse(savedData);
    
    tasks.forEach(task => {
        // PASS ALL 4 DATA POINTS IN ORDER:
        const savedTask = createTaskElement(
            task.text,      // 1. Text
            task.day,       // 2. Day (This stops the "False" error!)
            task.time,      // 3. Time
            task.completed  // 4. Completed status
        );
        
        listShow.appendChild(savedTask);
    });

    if (window.lucide) lucide.createIcons(); 
}

// Event Listeners
addButton.addEventListener('click', addTask);
inputedTask.addEventListener('keypress', (event) => {
    if(event.key === 'Enter') addTask(event);
});
function formatTime(timeString) {
    // If it's empty, show "Anytime"
    if (!timeString || timeString === "") return "Anytime";
    
    // Since you already formatted it as "08:43 PM" in addTask,
    // just return it exactly as it is. This stops the "AM AM" bug.
    return timeString; 
}


function initTimePicker() {
    const trigger = document.getElementById('time-trigger');
    const menu = document.getElementById('custom-time-menu');

    if (!trigger || !menu) return;

    trigger.onclick = (e) => {
        // This is the most important line! 
        // It prevents the "window.onclick" from firing at the same time.
        e.stopPropagation(); 

        const isVisible = menu.style.display === 'grid';
        
        // Toggle the display
        if (isVisible) {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'grid';
        }
    };
    
    // Call your loops to fill the numbers here...
    generateTimeOptions(); 
}

// Separate listener for clicking outside
window.addEventListener('click', (e) => {
    const menu = document.getElementById('custom-time-menu');
    const trigger = document.getElementById('time-trigger');
    
    // Only close if the click was NOT on the menu or the trigger
    if (menu && !trigger.contains(e.target)) {
        menu.style.display = 'none';
    }
});

function generateTimeOptions() {
    const hoursCol = document.getElementById('hours-col');
    const minsCol = document.getElementById('mins-col');
    const ampmCol = document.getElementById('ampm-col');

    // 1. Hours (01-12) - You already have this
    for(let i = 1; i <= 12; i++) {
        const opt = document.createElement('div');
        opt.className = 'time-option';
        opt.textContent = i.toString().padStart(2, '0');
        opt.onclick = (e) => { e.stopPropagation(); selectOption(hoursCol, opt); };
        hoursCol.appendChild(opt);
    }

    // 2. NEW: Minutes (00-55)
    for(let i = 0; i < 60; i += 1) {
        const opt = document.createElement('div');
        opt.className = 'time-option';
        opt.textContent = i.toString().padStart(2, '0');
        opt.onclick = (e) => { e.stopPropagation(); selectOption(minsCol, opt); };
        minsCol.appendChild(opt);
    }

    // 3. NEW: AM/PM Click Logic
    Array.from(ampmCol.children).forEach(opt => {
        opt.onclick = (e) => {
            e.stopPropagation();
            selectOption(ampmCol, opt);
        };
    });
}

function selectOption(container, element) {
    Array.from(container.children).forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
}
// Run this when the page opens
loadFromLocalStorage();
// CRITICAL: Call the function at the bottom of todo.js
initTimePicker();