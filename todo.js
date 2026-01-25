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
        checkIcon.setAttribute('data-lucide', isDone ? 'check-circle-2' : 'circle');
        lucide.createIcons();
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

function addTask(event) {
    event.preventDefault();
    const taskValue = inputedTask.value.trim();
    if (taskValue === "") return;

    // Create a clean object so we don't get confused
    const taskData = {
        text: taskValue,
        day: taskDay.value,
        time: taskTime.value,
        completed: false
    };

    // FIX: Hand over the data in the EXACT order the helper expects:
    // 1. Text | 2. Day | 3. Time | 4. Completed
    const newTask = createTaskElement(
        taskData.text, 
        taskData.day, 
        taskData.time, 
        taskData.completed
    );
    
    listShow.appendChild(newTask);

    saveToLocalStorage();
    lucide.createIcons();
    inputedTask.value = "";
    inputedTask.focus();
}

function saveToLocalStorage() {
    const tasks = [];
    document.querySelectorAll('.todo-item').forEach(item => {
        tasks.push({
            text: item.querySelector('.task-text').textContent,
            // Grab the text from your new labels
            day: item.querySelector('.day-tag').textContent, 
            time: item.querySelector('.time-tag').textContent,
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
    // If no time is picked, return a default string
    if (!timeString || timeString === "") return "Anytime";
    
    try {
        let [hours, minutes] = timeString.split(':');
        // If the split failed, minutes will be undefined
        if (minutes === undefined) return "Anytime";

        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        
        return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
        return "Anytime";
    }
}

// Run this when the page opens
loadFromLocalStorage();