const inputedTask = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const listShow = document.getElementById('listShow');

// HELPER FUNCTION: This does all the building
function createTaskElement(taskValue, isCompleted = false) {
    const listItem = document.createElement('li');
    listItem.className = 'todo-item';
    if (isCompleted) listItem.classList.add('completed');

    // 1. Check Button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-btn';
    const checkIcon = document.createElement('i');
    checkIcon.setAttribute('data-lucide', isCompleted ? 'check-circle-2' : 'circle');
    checkBtn.appendChild(checkIcon);

    // 2. Text
    const textSpan = document.createElement('span');
    textSpan.textContent = taskValue;

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

    listItem.appendChild(checkBtn);
    listItem.appendChild(textSpan);
    listItem.appendChild(deleteBtn);
    
    return listItem;
}

function addTask(event) {
    event.preventDefault();
    const taskValue = inputedTask.value.trim();
    if (taskValue === "") return;

    // FIX 1: Make sure this name matches the helper function
    const newTask = createTaskElement(taskValue);
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
            text: item.querySelector('span').textContent,
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
        // FIX 2: You must append the result to the listShow!
        const savedTask = createTaskElement(task.text, task.completed);
        listShow.appendChild(savedTask);
    });
    lucide.createIcons(); // Refresh icons after loading
}

// Event Listeners
addButton.addEventListener('click', addTask);
inputedTask.addEventListener('keypress', (event) => {
    if(event.key === 'Enter') addTask(event);
});

// Run this when the page opens
loadFromLocalStorage();