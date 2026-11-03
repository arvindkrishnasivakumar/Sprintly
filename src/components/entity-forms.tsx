import { ActionForm, Field, TextArea, Select, type Action } from "./forms";
import {
  projectStatuses,
  sprintStatuses,
  taskStatuses,
  priorities,
} from "@/lib/validation";
export function ProjectForm({
  action,
  project,
}: {
  action: Action;
  project?: { name: string; description: string; status: string };
}) {
  return (
    <ActionForm
      action={action}
      submit={project ? "Update project" : "Create project"}
    >
      <Field
        label="Project name"
        name="name"
        defaultValue={project?.name}
        required
        maxLength={100}
      />
      <TextArea
        label="Description"
        name="description"
        defaultValue={project?.description}
      />
      <Select
        label="Status"
        name="status"
        values={projectStatuses}
        defaultValue={project?.status}
      />
    </ActionForm>
  );
}
export function SprintForm({
  action,
  sprint,
}: {
  action: Action;
  sprint?: {
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };
}) {
  return (
    <ActionForm
      action={action}
      submit={sprint ? "Update sprint" : "Create sprint"}
    >
      <Field
        label="Sprint name"
        name="name"
        defaultValue={sprint?.name}
        required
        maxLength={100}
      />
      <TextArea label="Sprint goal" name="goal" defaultValue={sprint?.goal} />
      <div className="form-grid">
        <Field
          label="Start date"
          name="startDate"
          type="date"
          defaultValue={sprint?.startDate.toISOString().slice(0, 10)}
          required
        />
        <Field
          label="End date"
          name="endDate"
          type="date"
          defaultValue={sprint?.endDate.toISOString().slice(0, 10)}
          required
        />
      </div>
      <Select
        label="Status"
        name="status"
        values={sprintStatuses}
        defaultValue={sprint?.status}
      />
    </ActionForm>
  );
}
export type TaskValue = {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  storyPoints: number;
};
export function TaskFields({
  members,
  task,
}: {
  members: { id: string; name: string }[];
  task?: TaskValue;
}) {
  return (
    <>
      <Field
        label="Title"
        name="title"
        defaultValue={task?.title}
        required
        maxLength={200}
      />
      <TextArea
        label="Description"
        name="description"
        defaultValue={task?.description}
        maxLength={5000}
      />
      <label>
        Assignee
        <select name="assigneeId" defaultValue={task?.assigneeId ?? ""}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <div className="form-grid">
        <Select
          label="Priority"
          name="priority"
          values={priorities}
          defaultValue={task?.priority ?? "MEDIUM"}
        />
        <Select
          label="Status"
          name="status"
          values={taskStatuses}
          defaultValue={task?.status}
        />
        <Field
          label="Due date"
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate?.slice(0, 10)}
        />
        <Field
          label="Story points"
          name="storyPoints"
          type="number"
          min={0}
          max={100}
          defaultValue={task?.storyPoints ?? 0}
          required
        />
      </div>
    </>
  );
}
