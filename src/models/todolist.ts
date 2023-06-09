export type SingleTask = {
  id: number;
  title: string;
  note: string;
  pomodoroCount: number;
  pomodoroEstimate: number;
  checked: boolean;
  selected: boolean;
};

export type NewTask = {
  title: string;
  note: string;
  pomodoroEstimate: number;
};
