const inputedTask = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const listShow = document.getElementById('listShow');
const taskDay = document.getElementById('day-schedule');

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
    dayLabel.className = 'day-tag';
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
        
        const currentIcon = checkBtn.querySelector('[data-lucide]');
        currentIcon.setAttribute('data-lucide', isDone ? 'check-circle-2' : 'circle');
        
        if (window.lucide) {
            lucide.createIcons();
        }
        
        saveToLocalStorage();
    };

    metaContainer.appendChild(timeLabel);

    listItem.appendChild(checkBtn);
    listItem.appendChild(textSpan);
    listItem.appendChild(dayLabel);
    listItem.appendChild(metaContainer);
    listItem.appendChild(deleteBtn);
    
    return listItem;
}

function addTask(event) {
    event.preventDefault();
    
    const taskValue = inputedTask.value.trim();
    if (taskValue === "") return;

    const hour = document.querySelector('#hours-col .selected')?.textContent || "ANY";
    const min = document.querySelector('#mins-col .selected')?.textContent || "TIME";
    const ampm = document.querySelector('#ampm-col .selected')?.textContent || "";

    const taskData = {
        text: taskValue,
        day: taskDay.value || "Anyday",
        time: `${hour}:${min} ${ampm}`,
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
        const savedTask = createTaskElement(
            task.text,
            task.day,
            task.time,
            task.completed
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
    if (!timeString || timeString === "") return "Anytime";
    return timeString;
}

function initTimePicker() {
    const trigger = document.getElementById('time-trigger');
    const menu = document.getElementById('custom-time-menu');

    if (!trigger || !menu) return;

    trigger.onclick = (e) => {
        e.stopPropagation();
        const isVisible = menu.style.display === 'grid';
        
        if (isVisible) {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'grid';
        }
    };
    
    generateTimeOptions();
}

// Close menu when clicking outside
window.addEventListener('click', (e) => {
    const menu = document.getElementById('custom-time-menu');
    const trigger = document.getElementById('time-trigger');
    
    if (menu && !trigger.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});

function generateTimeOptions() {
    const hoursCol = document.getElementById('hours-col');
    const minsCol = document.getElementById('mins-col');
    const ampmCol = document.getElementById('ampm-col');

    // Hours (01-12)
    for(let i = 1; i <= 12; i++) {
        const opt = document.createElement('div');
        opt.className = 'time-option';
        opt.textContent = i.toString().padStart(2, '0');
        opt.onclick = (e) => { 
            e.stopPropagation(); 
            selectOption(hoursCol, opt); 
        };
        hoursCol.appendChild(opt);
    }

    // Minutes (00-59)
    for(let i = 0; i < 60; i += 1) {
        const opt = document.createElement('div');
        opt.className = 'time-option';
        opt.textContent = i.toString().padStart(2, '0');
        opt.onclick = (e) => { 
            e.stopPropagation(); 
            selectOption(minsCol, opt); 
        };
        minsCol.appendChild(opt);
    }

    // AM/PM
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

// Initialize on page load
loadFromLocalStorage();
initTimePicker();