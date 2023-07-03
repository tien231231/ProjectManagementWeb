import { ITask } from "../pages/tasksPage/TaskForm";
const prioList: any = {
  highest: 5,
  high: 4,
  medium: 3,
  low: 2,
  lowest: 1,
};

export const setupTasks = (
  tasks: any,
  query: {
    [k: string]: string;
  },
  members: string[]
) => {
  if (query.type) {
    if (query.type === "all") {
      tasks = tasks.filter((task: ITask) => {
        return task;
      });
    } else {
      tasks = tasks.filter((task: ITask) => task.type === query.type);
    }
  }
  if (query.sort) {
    if (query.sort.includes("prio")) {
      tasks.sort((a: ITask, b: ITask) => {
        return query.sort.includes("Asc")
          ? prioList[a.priority] - prioList[b.priority]
          : prioList[b.priority] - prioList[a.priority];
      });
    }
    if (query.sort.includes("deadline")) {
      tasks.sort((a: ITask, b: ITask) => {
        let d1 = Number(new Date(a.deadline));
        let d2 = Number(new Date(b.deadline));
        return query.sort.includes("Asc") ? d1 - d2 : d2 - d1;
      });
    }
  } else {
    tasks.sort((a: ITask, b: ITask) => {
      let d1 = Number(new Date(a.deadline));
      let d2 = Number(new Date(b.deadline));
      return d1 - d2;
    });
  }
  if (members && members?.length === 0) {
    tasks = tasks.filter((task: any) => {
      return task;
    });
  }

  if (members && members?.length > 0) {
    tasks = tasks.filter((task: any) => {
      return members.some(
        (memberName: any) => memberName === task.assignee.username
      );
    });
  }
  if (query.search) {
    tasks = tasks.filter((task: any) => {
      return task.title.toLowerCase().includes(query.search);
    });
  }
  return tasks;
};
