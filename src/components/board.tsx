"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare2,
  ChevronDown,
  Columns3,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
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
  const [view, setView] = useState<"list" | "board">("list");
  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const router = useRouter();
  const focusReturn = useRef<HTMLButtonElement | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (selected || creating) detailRef.current?.focus({ preventScroll: true });
  }, [selected, creating]);
  const current = tasks.find((t) => t.id === selected);
  const panel = creating || !!current;
  const filtered = tasks.filter(
    (t) =>
      `${t.title} ${t.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (assignee === "all" ||
        (assignee === "unassigned"
          ? !t.assigneeId
          : t.assigneeId === assignee)) &&
      (statusFilter === "all" || t.status === statusFilter),
  );
  function open(task: TaskValue, event: React.MouseEvent<HTMLButtonElement>) {
    focusReturn.current = event.currentTarget;
    setCreating(false);
    setSelected(task.id);
  }
  function close() {
    setCreating(false);
    setSelected(null);
    focusReturn.current?.focus();
  }
  function create(event: React.MouseEvent<HTMLButtonElement>) {
    focusReturn.current = event.currentTarget;
    setSelected(null);
    setCreating(true);
  }
  function move(id: string, status: string) {
    if (pending || !tasks.some((t) => t.id === id)) return;
    setError("");
    start(async () => {
      try {
        const result = await moveTask(id, status);
        if (result.error) setError(result.error);
        else router.refresh();
      } catch {
        setError("Could not update task. Please try again.");
      }
    });
  }
  function statusMenu(task: TaskValue) {
    return (
      <select
        className={`inline-status ${task.status.toLowerCase()}`}
        aria-label={`Status for ${task.title}`}
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
    );
  }
  function person(id: string | null) {
    const name = members.find((m) => m.id === id)?.name;
    return (
      <span className="assignee-cell">
        {name && <span className="avatar tiny">{name[0]}</span>}
        <span>{name ?? "Unassigned"}</span>
      </span>
    );
  }
  return (
    <>
      <div className="project-tabs" role="tablist" aria-label="Sprint views">
        <button
          role="tab"
          id="list-tab"
          aria-selected={view === "list"}
          aria-controls="task-view"
          onClick={() => setView("list")}
        >
          <List size={15} />
          List
        </button>
        <button
          role="tab"
          id="board-tab"
          aria-selected={view === "board"}
          aria-controls="task-view"
          onClick={() => setView("board")}
        >
          <Columns3 size={15} />
          Board
        </button>
      </div>
      <div className={`work-area ${panel ? "has-panel" : ""}`}>
        <div className="work-main">
          <div className="task-toolbar">
            <label className="task-search">
              <Search size={15} />
              <span className="sr-only">Search tasks</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks"
              />
            </label>
            <label className="sr-only" htmlFor="assignee-filter">
              Filter by assignee
            </label>
            <select
              id="assignee-filter"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="all">Assignee: All</option>
              <option value="unassigned">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="status-filter">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Status: All</option>
              {taskStatuses.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
            <span className="toolbar-count">{filtered.length} tasks</span>
            <button className="btn" onClick={create}>
              <Plus size={14} />
              Create task
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div
            id="task-view"
            role="tabpanel"
            aria-labelledby={`${view}-tab`}
            aria-busy={pending}
          >
            {view === "list" ? (
              <div className="task-table-wrap">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th aria-label="Type" className="type-cell">
                        Type
                      </th>
                      <th>Key</th>
                      <th className="summary-column">Summary</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Points</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskStatuses
                      .filter(
                        (s) => statusFilter === "all" || s === statusFilter,
                      )
                      .map((status) => {
                        const group = filtered.filter(
                          (t) => t.status === status,
                        );
                        const folded = collapsed.includes(status);
                        return (
                          <TaskGroup
                            key={status}
                            status={status}
                            count={group.length}
                            collapsed={folded}
                            onToggle={() =>
                              setCollapsed((v) =>
                                v.includes(status)
                                  ? v.filter((s) => s !== status)
                                  : [...v, status],
                              )
                            }
                          >
                            {group.map((task) => (
                              <tr
                                key={task.id}
                                className={
                                  selected === task.id ? "selected-row" : ""
                                }
                              >
                                <td className="type-cell">
                                  <CheckSquare2
                                    size={15}
                                    className="issue-icon"
                                  />
                                </td>
                                <td className="issue-key">
                                  SP-{tasks.indexOf(task) + 1}
                                </td>
                                <td>
                                  <button
                                    className="task-title-button"
                                    onClick={(e) => open(task, e)}
                                  >
                                    {task.title}
                                  </button>
                                </td>
                                <td>{statusMenu(task)}</td>
                                <td>{person(task.assigneeId)}</td>
                                <td>
                                  <span
                                    className={`priority ${task.priority.toLowerCase()}`}
                                  >
                                    {label(task.priority)}
                                  </span>
                                </td>
                                <td className="points-cell">
                                  {task.storyPoints}
                                </td>
                                <td className="due-cell">
                                  {task.dueDate?.slice(0, 10) ?? "—"}
                                </td>
                              </tr>
                            ))}
                          </TaskGroup>
                        );
                      })}
                  </tbody>
                </table>
                {!filtered.length && (
                  <p className="table-empty">
                    {tasks.length
                      ? "No tasks match these filters."
                      : "No tasks in this sprint yet."}
                  </p>
                )}
                <button className="table-create" onClick={create}>
                  <Plus size={15} />
                  Create task
                </button>
              </div>
            ) : (
              <div className="board">
                {taskStatuses
                  .filter((s) => statusFilter === "all" || s === statusFilter)
                  .map((status) => (
                    <section
                      className="board-column"
                      key={status}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        move(e.dataTransfer.getData("text/plain"), status);
                      }}
                    >
                      <h3>
                        <span
                          className={`status-dot ${status.toLowerCase()}`}
                        />
                        {label(status)}
                        <span className="count">
                          {filtered.filter((t) => t.status === status).length}
                        </span>
                      </h3>
                      {filtered
                        .filter((t) => t.status === status)
                        .map((task) => (
                          <article
                            key={task.id}
                            className={`task-card ${selected === task.id ? "selected-card" : ""}`}
                            draggable={!pending}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", task.id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                          >
                            <button
                              className="task-title-button"
                              onClick={(e) => open(task, e)}
                            >
                              {task.title}
                            </button>
                            <div className="task-card-info">
                              <span className="issue-key">
                                <CheckSquare2 size={13} />
                                SP-{tasks.indexOf(task) + 1}
                              </span>
                              <span className="points-pill">
                                {task.storyPoints}
                              </span>
                            </div>
                            <div className="task-card-info">
                              <span
                                className={`priority ${task.priority.toLowerCase()}`}
                              >
                                {label(task.priority)}
                              </span>
                              {person(task.assigneeId)}
                            </div>
                            {statusMenu(task)}
                          </article>
                        ))}
                      <button className="column-create" onClick={create}>
                        <Plus size={14} />
                        Create task
                      </button>
                    </section>
                  ))}
              </div>
            )}
          </div>
          <p className="table-note">
            {pending
              ? "Saving changes…"
              : view === "board"
                ? "Drag tasks between columns, or select a status."
                : "Select a task to view and edit its details."}
          </p>
        </div>
        {panel && (
          <aside
            ref={detailRef}
            tabIndex={-1}
            className="task-detail"
            aria-label={creating ? "Create task" : "Task details"}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
          >
            <div className="detail-top">
              <span>
                {creating ? "New task" : `SP-${tasks.indexOf(current!) + 1}`}
              </span>
              <button
                className="icon-button"
                onClick={close}
                aria-label="Close task details"
              >
                <X size={18} />
              </button>
            </div>
            <h2>{creating ? "Create task" : current?.title}</h2>
            <div className="detail-subtitle">
              {creating ? "Add work to this sprint" : "Task details"}
            </div>
            <ActionForm
              key={creating ? "create" : JSON.stringify(current)}
              action={saveTask.bind(
                null,
                sprintId,
                creating ? null : current!.id,
              )}
              submit={creating ? "Create task" : "Save changes"}
            >
              <TaskFields
                task={creating ? undefined : current}
                members={members}
              />
            </ActionForm>
          </aside>
        )}
      </div>
    </>
  );
}
function TaskGroup({
  status,
  count,
  collapsed,
  onToggle,
  children,
}: {
  status: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <tr className="task-group">
        <th colSpan={8}>
          <button onClick={onToggle} aria-expanded={!collapsed}>
            <ChevronDown size={14} className={collapsed ? "folded" : ""} />
            <span className={`status-dot ${status.toLowerCase()}`} />
            {label(status)}
            <span>
              {count} {count === 1 ? "task" : "tasks"}
            </span>
          </button>
        </th>
      </tr>
      {!collapsed && children}
    </>
  );
}
