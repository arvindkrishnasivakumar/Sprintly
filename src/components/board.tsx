"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveTask, saveTask } from "@/lib/actions";
import { taskStatuses, label } from "@/lib/validation";
import { ActionForm } from "./forms";
import { TaskFields, type TaskValue } from "./entity-forms";
export function Board({
  tasks,
  members,
  sprintId,
}: {
  tasks: TaskValue[];
  members: { id: string; name: string }[];
  sprintId: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const router = useRouter();
  function move(id: string, status: string) {
    if (pending || !tasks.some((t) => t.id === id)) return;
    setError("");
    start(async () => {
      try {
        const result = await moveTask(id, status);
        if (result.error) setError(result.error);
        else router.refresh();
      } catch {
        setError("Could not move task. Please try again.");
      }
    });
  }
  return (
    <>
      <div className="board-heading">
        <h2>
          Task board <span className="count">{tasks.length}</span>
        </h2>
        <span className="muted">
          {pending ? "Saving move…" : "Drag cards or use their status menu"}
        </span>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="board" aria-busy={pending}>
        {taskStatuses.map((status) => (
          <section
            className="board-column"
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              setDragging(null);
              move(id, status);
            }}
          >
            <h3>
              <span className={`status-dot ${status.toLowerCase()}`} />
              {label(status)}
              <span className="count">
                {tasks.filter((t) => t.status === status).length}
              </span>
            </h3>
            <div className="column-tasks">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <article
                    key={task.id}
                    className={`task-card ${dragging === task.id ? "dragging" : ""}`}
                    draggable={!pending}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", task.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(task.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                  >
                    <div className="task-meta">
                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        {label(task.priority)}
                      </span>
                      <span>{task.storyPoints} pts</span>
                    </div>
                    <h4>{task.title}</h4>
                    {task.description && (
                      <p className="clamp">{task.description}</p>
                    )}
                    <div className="task-footer">
                      <span>
                        {members.find((m) => m.id === task.assigneeId)?.name ??
                          "Unassigned"}
                      </span>
                      {task.dueDate && (
                        <time dateTime={task.dueDate}>
                          {task.dueDate.slice(0, 10)}
                        </time>
                      )}
                    </div>
                    <label className="sr-only" htmlFor={`status-${task.id}`}>
                      Status for {task.title}
                    </label>
                    <select
                      id={`status-${task.id}`}
                      value={task.status}
                      disabled={pending}
                      onChange={(e) => move(task.id, e.target.value)}
                    >
                      {taskStatuses.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                    <details onDragStart={(e) => e.stopPropagation()}>
                      <summary>Edit task</summary>
                      <ActionForm
                        action={saveTask.bind(null, sprintId, task.id)}
                        submit="Update task"
                      >
                        <TaskFields task={task} members={members} />
                      </ActionForm>
                    </details>
                  </article>
                ))}
              {!tasks.some((t) => t.status === status) && (
                <p className="column-empty">No tasks yet</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
