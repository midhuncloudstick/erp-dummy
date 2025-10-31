import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, Repeat, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StaffOption, TodoItem } from "@/store/slices/todoListSlice";

// interface Todo {
//   title: string;
//   description?: string;
//   completed: boolean;
//   type: "onetime" | "recurring";
//   dueDate?: Date;
//   assignedTo?: string;
//   recurringPattern?: {
//     frequency: "daily" | "weekly" | "monthly";
//     time?: string;
//     dayOfWeek?: number;
//     dayOfMonth?: number;
//   };
// }
interface PayloadType {
  task_title?: string;
  description?: string;
  task_type?: string;
  recurring_frequency?: string;
  time_of_day?: string | null;
  // add other fields as needed
}

interface CreateTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTodo: (todo: TodoItem) => void;
  assignedStaff: StaffOption[];
}

const CreateTodoDialog = ({
  open,
  onOpenChange,
  assignedStaff,
  onCreateTodo,
}: CreateTodoDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"onetime" | "recurring">("onetime");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assignedTo, setAssignedTo] = useState<number | undefined>();
  const [payload, setPayload] = useState<PayloadType>({});
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [time, setTime] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<string | undefined>(undefined);
  const [dayOfMonth, setDayOfMonth] = useState<string>("1");
  const [monthOfYear, setMonthOfYear] = useState<string>("January");
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  // Mock staff data - in real app this would come from API
  // const staffMembers = [
  //   { id: 1, name: "John Smith", role: "Developer" },
  //   { id: 2, name: "Sarah Johnson", role: "Designer" },
  //   { id: 3, name: "Mike Wilson", role: "Manager" },
  //   { id: 4, name: "Lisa Brown", role: "Analyst" },
  // ];

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("onetime");
    setDueDate(undefined);
    setAssignedTo(undefined);
    setFrequency("daily");
    setTime("");
    setDayOfWeek("1");
    setDayOfMonth("1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Capitalize frequency for backend (Daily/Weekly/Monthly)
    const formatFrequency = (f: string) => {
      switch (f) {
        case "daily":
          return "Daily";
        case "weekly":
          return "Weekly";
        case "monthly":
          return "Monthly";
        case "yearly":
          return "Yearly";
        default:
          return null;
      }
    };
    const completedTodos = tasks.filter((t) => t.status);
    const pendingTodos = tasks.filter((t) => !t.status);

    const handleCreateTodo = (todo: TodoItem) => {
      // setTasks((prev) => [
      //   ...prev,
      //   { ...todo, id: Date.now(), status: false } // `status` tracks completed/pending
      // ]);
    };

    const todoPayload: TodoItem = {
      task_title: title.trim(),
      description: description.trim() || null,
      task_type: type === "onetime" ? "OneTime" : "Recurring",
      due_date: type === "onetime" && dueDate ? dueDate.toISOString() : null,
      recurring_frequency:
        type === "recurring" ? formatFrequency(frequency) : null,

      time_of_day:
        frequency === "daily" && time
          ? (() => {
            const [hours, minutes] = time.split(":").map(Number);

            // Get the current date in the local timezone
            const today = new Date();

            // Create a new Date object using UTC values.
            // This represents the user's selected time (e.g., 10:30) as a UTC time.
            const istTimeAsUtc = new Date(Date.UTC(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              hours,
              minutes,
              0,
              0
            ));

            return istTimeAsUtc.toISOString();
          })()
          : null,

      day_of_week: frequency === "weekly" ? dayOfWeek || null : null,
      day_of_month: frequency === "monthly" ? Number(dayOfMonth) || null : null,
      month_of_year: frequency === "yearly" ? monthOfYear || null : null,
      assign_to_staff: assignedTo ? Number(assignedTo) : null,
    };

    console.log("Payload being sent:", todoPayload);

    onCreateTodo(todoPayload);
    resetForm();

    onOpenChange(false);
  };






  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = e.target.value; // e.g., "17:13"
    setTime(selectedTime);

    if (selectedTime) {
      const today = new Date(); // current date
      const [hours, minutes] = selectedTime.split(":").map(Number);

      today.setHours(hours, minutes, 0, 0); // set time on today's date

      setPayload((prev) => ({
        ...prev,
        time_of_day: today.toISOString(), // includes today's date
      }));
      console.log(today.toISOString())
    }
  };


  const getDayName = (day: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day];
  };

  const generateDayOptions = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional task description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Task Type</Label>
            <Select
              value={type}
              onValueChange={(value: "onetime" | "recurring") => setType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onetime">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    One-time Task
                  </div>
                </SelectItem>
                <SelectItem value="recurring">
                  <div className="flex items-center">
                    <Repeat className="h-4 w-4 mr-2" />
                    Recurring Task
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign to Staff (Optional)</Label>
            <Select
              value={assignedTo?.toString()}
              onValueChange={(value: string) => setAssignedTo(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {assignedStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id?.toString()}>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">{staff.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {staff.role_name}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "onetime" && (
            <div>
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                value={
                  dueDate
                    ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(
                      dueDate.getDate()
                    ).padStart(2, "0")}`
                    : ""
                }
                min={new Date().toISOString().split("T")[0]} // ✅ disable past dates
                placeholder="dd/mm/yyyy"
                onChange={(e) => {
                  if (!e.target.value) return setDueDate(null);

                  const [year, month, day] = e.target.value.split("-").map(Number);
                  const selectedDate = new Date(year, month - 1, day); // ✅ Local date

                  setDueDate(selectedDate);
                }}
                className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 pr-8"
              />




            </div>
          )}


          {type === "recurring" && (
            <div className="space-y-4">
              {/* Frequency Select */}
              <div>
                <Label htmlFor="frequency">Recurring Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(
                    value: "daily" | "weekly" | "monthly" | "yearly"
                  ) => setFrequency(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Daily */}
              {frequency === "daily" && (
                <div>
                  <Label htmlFor="time">Time</Label>
                  <input className="mx-4" type="time" value={time} onChange={handleTimeChange} />
                </div>
              )}

              {/* Weekly */}
              {frequency === "weekly" && (
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select
                    value={dayOfWeek}
                    onValueChange={(value) => setDayOfWeek(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ].map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Monthly */}
              {frequency === "monthly" && (
                <div>
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                  />
                </div>
              )}

              {/* Yearly */}
              {frequency === "yearly" && (
                <div>
                  <Label htmlFor="monthOfYear">Month</Label>
                  <Select
                    value={monthOfYear}
                    onValueChange={(value) => setMonthOfYear(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTodoDialog;
