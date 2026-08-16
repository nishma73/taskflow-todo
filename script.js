/* =========================================
   TASKFLOW
   JavaScript To-Do Application
========================================= */


/* -----------------------------------------
   DOM ELEMENTS
----------------------------------------- */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

const emptyState = document.getElementById("emptyState");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const clearCompleted =
    document.getElementById("clearCompleted");

const clearAll =
    document.getElementById("clearAll");

const editModal =
    document.getElementById("editModal");

const editInput =
    document.getElementById("editInput");

const saveEdit =
    document.getElementById("saveEdit");

const closeModal =
    document.getElementById("closeModal");


/* -----------------------------------------
   APPLICATION STATE
----------------------------------------- */

let tasks =
    JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";

let editingTaskId = null;


/* -----------------------------------------
   SAVE STATE
----------------------------------------- */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


/* -----------------------------------------
   CREATE TASK
----------------------------------------- */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const text =
        taskInput.value.trim();

    if (!text) {
        return;
    }

    const newTask = {

        id: Date.now(),

        text: text,

        completed: false

    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();

});


/* -----------------------------------------
   RENDER TASKS
----------------------------------------- */

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {

        filteredTasks =
            tasks.filter(task => !task.completed);

    }

    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(task => task.completed);

    }


    filteredTasks.forEach(task => {

        const taskElement =
            document.createElement("article");

        taskElement.className =
            `task ${task.completed ? "completed" : ""}`;

        taskElement.dataset.id = task.id;


        taskElement.innerHTML = `

            <button
                class="check-btn"
                type="button"
                aria-label="${
                    task.completed
                    ? "Mark task active"
                    : "Mark task completed"
                }"
                data-action="toggle"
            ></button>


            <p class="task-text">
                ${escapeHTML(task.text)}
            </p>


            <div class="task-actions">

                <button
                    type="button"
                    aria-label="Edit task"
                    data-action="edit"
                >
                    ✎
                </button>

                <button
                    type="button"
                    aria-label="Delete task"
                    class="delete-btn"
                    data-action="delete"
                >
                    ×
                </button>

            </div>

        `;


        taskList.appendChild(taskElement);

    });


    updateInterface(filteredTasks);

}


/* -----------------------------------------
   UPDATE UI
----------------------------------------- */

function updateInterface(filteredTasks) {

    const activeTasks =
        tasks.filter(task => !task.completed).length;

    taskCount.textContent = activeTasks;


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }

}


/* -----------------------------------------
   EVENT DELEGATION
----------------------------------------- */

taskList.addEventListener("click", function (event) {

    const button =
        event.target.closest("button");

    if (!button) {
        return;
    }

    const taskElement =
        event.target.closest(".task");

    const taskId =
        Number(taskElement.dataset.id);

    const action =
        button.dataset.action;


    if (action === "toggle") {

        toggleTask(taskId);

    }


    if (action === "edit") {

        openEditModal(taskId);

    }


    if (action === "delete") {

        deleteTask(taskId);

    }

});


/* -----------------------------------------
   TOGGLE TASK
----------------------------------------- */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {

                    ...task,

                    completed:
                        !task.completed

                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

}


/* -----------------------------------------
   DELETE TASK
----------------------------------------- */

function deleteTask(id) {

    tasks =
        tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}


/* -----------------------------------------
   EDIT TASK
----------------------------------------- */

function openEditModal(id) {

    const task =
        tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    editingTaskId = id;

    editInput.value = task.text;

    editModal.classList.add("show");

    editModal.setAttribute(
        "aria-hidden",
        "false"
    );

    editInput.focus();

}


function closeEditModal() {

    editModal.classList.remove("show");

    editModal.setAttribute(
        "aria-hidden",
        "true"
    );

    editingTaskId = null;

}


saveEdit.addEventListener("click", function () {

    const newText =
        editInput.value.trim();

    if (!newText || editingTaskId === null) {
        return;
    }


    tasks =
        tasks.map(task => {

            if (task.id === editingTaskId) {

                return {

                    ...task,

                    text: newText

                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

    closeEditModal();

});


closeModal.addEventListener(
    "click",
    closeEditModal
);


/* -----------------------------------------
   CLOSE MODAL WHEN CLICKING OUTSIDE
----------------------------------------- */

editModal.addEventListener(
    "click",
    function (event) {

        if (event.target === editModal) {

            closeEditModal();

        }

    }
);


/* -----------------------------------------
   ESC KEY
----------------------------------------- */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            editModal.classList.contains("show")
        ) {

            closeEditModal();

        }

    }
);


/* -----------------------------------------
   FILTERS
----------------------------------------- */

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            this.classList.add("active");

            currentFilter =
                this.dataset.filter;

            renderTasks();

        }
    );

});


/* -----------------------------------------
   CLEAR COMPLETED
----------------------------------------- */

clearCompleted.addEventListener(
    "click",
    function () {

        tasks =
            tasks.filter(
                task => !task.completed
            );

        saveTasks();

        renderTasks();

    }
);


/* -----------------------------------------
   DELETE ALL
----------------------------------------- */

clearAll.addEventListener(
    "click",
    function () {

        if (tasks.length === 0) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete all tasks?"
            );


        if (!confirmed) {
            return;
        }


        tasks = [];

        saveTasks();

        renderTasks();

    }
);


/* -----------------------------------------
   ESCAPE HTML
   Prevents HTML injection
----------------------------------------- */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* -----------------------------------------
   INITIAL RENDER
----------------------------------------- */

renderTasks();