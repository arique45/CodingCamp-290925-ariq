document.addEventListener('DOMContentLoaded', () => {
    const taskinput = document.getElementById('taskinput');   // id harus sesuai HTML
    const dateinput = document.getElementById('dateinput');   // id harus sesuai HTML
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const tasksWrapper = document.querySelector('.tasks-wrapper');
    const filterSelect = document.getElementById('filter'); 
    const deleteAllBtn = document.getElementById('deleteAll');

    // Set min = hari ini
    const today = new Date().toISOString().split("T")[0];
    dateinput.setAttribute("min", today);

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let filter = 'all';

    // Simpan ke localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Render task sesuai filter
    function renderTasks() {
        let filteredTasks = [...tasks];

        // Apply filter
        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'incomplete') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'ascending') {
            filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (filter === 'descending') {
            filteredTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        }

    // Reset list
    taskList.innerHTML = '';

        // Jika tidak ada task
        if (filteredTasks.length === 0) {
            const li = document.createElement('li');
            li.className = 'text italic text-center p-2';
            li.textContent = 'No Tasks Available';
            taskList.appendChild(li);
            return;
        }

        // Render task jika ada
        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'bg-white flex justify-between items-center mb-4 p-2 border rounded task-item';

            if (task.completed) {
                li.classList.add('bg-green-100', 'line-through');
            }

            li.innerHTML = `
                <div>
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" class="mr-2">
                    <span>${task.description} - <em>${task.dueDate}</em></span>
                </div>
                <button data-index="${index}" class="bg-red-500 text-white px-2 py-1 rounded deleteBtn">Delete</button>
            `;
            taskList.appendChild(li);
        });

        // If more than 5 items, compute single item height and set max-height to show 5 items
        if (tasksWrapper) {
            const items = taskList.querySelectorAll('li');
            const visibleCount = 5;

            if (items.length > visibleCount) {
                const first = items[0];
                const style = window.getComputedStyle(first);
                const itemHeight = first.getBoundingClientRect().height + parseFloat(style.marginBottom || 0);
                tasksWrapper.style.maxHeight = (itemHeight * visibleCount) + 'px';
            } else {
                // remove maxHeight so no scrollbar when <= 5 items
                tasksWrapper.style.maxHeight = null;
            }
        }
    }

    // Tambah task
    addTaskBtn.addEventListener('click', () => {
        const description = taskinput.value.trim();
        const dueDate = dateinput.value;

        if (description && dueDate) {
            tasks.push({ description, dueDate, completed: false });
            saveTasks();
            renderTasks();

            taskinput.value = '';
            dateinput.value = '';
        }
    });

    // Checkbox & delete
    taskList.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            const index = e.target.getAttribute('data-index');
            tasks[index].completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
        if (e.target.classList.contains('deleteBtn')) {
            const index = e.target.getAttribute('data-index');
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    });

    // Filter & sort (gabung di select yang sama)
    filterSelect.addEventListener('change', (e) => {
        filter = e.target.value;
        renderTasks();
    });

    // Hapus semua
    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    // Render awal
    renderTasks();
});
