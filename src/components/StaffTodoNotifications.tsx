import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Clock, Calendar, Repeat } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  deleteTodo,
  fetchTodoList,
  TodoItem,
  toggleTodoStatus,
  GetAssignStaff,
  fetchAssignedTodoList,
  fetchCompletedTodos,
} from "@/store/slices/todoListSlice";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";




interface StaffTodoNotificationsProps {
  todoFilter: "created" | "assigned";
}


const StaffTodoNotifications = ({ todoFilter }: StaffTodoNotificationsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: todos,

  } = useSelector((state: RootState) => state.todoList);



  const { assignedStaff, assignedTodos } = useSelector((state: RootState) => state.todoList);

  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);



  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;


  // const allTodos = [...(todos || []), ...(assignedTodos || [])];


  // // Deduplicate by ID
  // const uniqueTodosMap = new Map<number, TodoItem>();
  // allTodos.forEach((todo) => {
  //   uniqueTodosMap.set(todo.id, todo);
  // });

  // const uniqueTodos = Array.from(uniqueTodosMap.values());

  // // Filter overdue
  // const overdueTodos = uniqueTodos.filter((todo) => todo.status === "Overdue");




  // const [dismissedTodoIds, setDismissedTodoIds] = useState<Set<number>>(
  //   new Set()
  // );

  const getTodoList = async () => {
    await dispatch(fetchTodoList())
  }

  const getAssignedTodoList = async () => {
    await dispatch(fetchAssignedTodoList())
  }

  const getCompletedTodoList = async (userId) => {
    await dispatch(fetchCompletedTodos(userId))
  }


  useEffect(() => {
    getTodoList()
    getAssignedTodoList()
    getCompletedTodoList(userId)
  }, [dispatch]);


  console.log(todos);
  const handleDelete = async (id) => {
    await dispatch(deleteTodo(id));
    getTodoList()
  };





  const getRecurringLabel = (todo: TodoItem) => {
    if (todo.task_type !== "Recurring" || !todo.recurring_frequency) return "";

    if (todo.recurring_frequency === "daily" && todo.time_of_day) {
      return `Daily at ${todo.time_of_day}`;
    }

    if (todo.recurring_frequency === "weekly" && todo.day_of_week) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return `Weekly on ${days[Number(todo.day_of_week)]}`;
    }

    if (todo.recurring_frequency === "monthly" && todo.day_of_month) {
      return `Monthly on day ${todo.day_of_month}`;
    }

    if (
      todo.recurring_frequency === "yearly" &&
      todo.month_of_year &&
      todo.day_of_month
    ) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `Yearly on ${months[Number(todo.month_of_year) - 1]} ${todo.day_of_month
        }`;
    }

    return "Recurring";
  };






  // We need to define the handleClickBox function here or import it
  const handleClickBox = async (todo: TodoItem) => {
    try {
      if (!userId || !todo.id) {
        toast.error("User ID or Todo ID is missing.");
        return;
      }

      if (todo.status === "Created" || todo.status === "Pending" || todo.status === "Overdue") {
        // Toggle to Completed
        await dispatch(toggleTodoStatus({ userId, todoId: todo.id }));
      }

      // Refresh the list
      getTodoList()
      getAssignedTodoList()
      getCompletedTodoList(userId)
    } catch (error) {
      console.log(error);
      toast.error("There was an error toggling the todo status.");
    }
  };

  useEffect(()=>{
    console.log("taskasdahsjdahkdjadh",(todoFilter === "created" ? (todos) : (assignedTodos)).filter((t) => t.created_by === userId))
  },[todoFilter])


  // const handleDismissNotification = (todoId: number | undefined) => {
  //   if (todoId !== undefined) {
  //     setDismissedTodoIds((prevIds) => new Set(prevIds).add(todoId));
  //   }
  // };

  // const activeOverdueTodos = overdueTodos.filter(
  //   (todo) => todo.id !== undefined && !dismissedTodoIds.has(todo.id)
  // );
  // console.log("activeOverduetood", activeOverdueTodos)

  function getOverdueDays(todo: any) {
    // Case 1: Standard due_date
    if (todo.due_date) {
      const today = new Date();
      const due = new Date(todo.due_date);
      const diff = today.getTime() - due.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Case 2: Weekly recurring task
    if (todo.recurring_frequency === "Weekly" && todo.day_of_week) {
      const today = new Date();
      const currentDay = today.getDay(); // 0=Sunday, 1=Monday...
      const targetDay = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(todo.day_of_week);

      // Calculate how many days since the last occurrence
      let diff = currentDay - targetDay;
      if (diff < 0) diff += 7; // wrap around
      return diff; // days overdue since the last due day
    }

    // Case 3: Monthly recurring task
    if (todo.recurring_frequency === "Monthly" && todo.day_of_month) {
      const today = new Date();
      const currentDay = today.getDate();
      if (currentDay > todo.day_of_month) {
        return currentDay - todo.day_of_month;
      }
      return 0;
    }

    // Case 4: Time of day (optional refinement)
    if (todo.recurring_frequency === "Daily" && todo.next_due_date) {
      const nextDue = new Date(todo.next_due_date);
      const today = new Date();
      const diff = today.getTime() - nextDue.getTime();
      return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
    }

    if (todo.recurring_frequency === "Yearly" && todo.next_due_date) {
      const nextDue = new Date(todo.next_due_date);
      const today = new Date();
      const diff = today.getTime() - nextDue.getTime();
      return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
    }
    // Default
    return 0;
  }

  const formatDueDate = (date?: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  if (todos.length === 0 && assignedTodos.length === 0) {
    return null;
  }

  return (
    <>
      {(
        (todoFilter === "created"
          ? todos.filter((t) => t.created_by === userId && t.status == "Overdue") 
          : assignedTodos.filter((t) => t.assign_to_staff === userId && t.status == "Overdue") 
        ).length > 0
      ) && (
      
      <Card className="bg-red-50 backdrop-blur-sm border-red-500/50 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />

            <CardTitle className="text-lg font-semibold text-red-900">
              Overdue Staff Tasks (
              {(todoFilter === "created"
                ? todos.filter(t => t.created_by === userId  && t.status == "Overdue")
                : assignedTodos.filter(t => t.assign_to_staff === userId && t.status == "Overdue")
              ).length}
              )
            </CardTitle>



          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(todoFilter === "created" ? (todos) : (assignedTodos)).filter((t) => t.status === "Overdue").map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-3 bg-red-100 rounded-lg border border-red-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {" "}
                  
                  <input
                    type="checkbox"
                    checked={false} 
                    onChange={() => handleClickBox(todo)} // <-- Use the handleClickBox function
                    className="mt-0.5 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-red-700">
                        {userId === todo.assign_to_staff ? (
                          <>
                            Assigned By:{" "}
                            {assignedStaff?.find(staff => staff.id === todo?.created_by)?.full_name || "Unknown"}
                          </>
                        ) : (
                          <>
                            Assigned To:{" "}
                            {assignedStaff?.find(staff => staff.id === todo?.assign_to_staff)?.full_name || "Not Assigned"}
                          </>
                        )}
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {getOverdueDays(todo)} day
                        {getOverdueDays(todo) > 1 ? "s" : ""} overdue
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-red-700">
                        {`${todo.task_title} `}
                      </p>
                      {todo.recurring_frequency && (
                        <Badge variant="outline" className="text-xs text-red-700">
                          {todo.recurring_frequency}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {todo.task_type === "Recurring" ? (
                        <>
                          <Badge variant="destructive" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            {getRecurringLabel(todo)}
                          </Badge>

                          {todo.due_date && (
                            <Badge variant="destructive" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due {formatDueDate(todo.due_date)}
                            </Badge>
                          )}

                          <Badge variant="destructive" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due Date : {" "}{formatDate(todo?.next_due_date)}
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            One-time
                          </Badge>
                          {todo.due_date && (
                            <Badge variant="destructive" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due {formatDueDate(todo.due_date)}
                            </Badge>
                          )}

                          <p className="text-sm font-medium text-red-700">
                            {formatDate(todo.created_at)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {(todoFilter === "created" ? (todos) : (assignedTodos)).filter((t) => t.status ==='Overdue' && t.created_by === userId).length> 0 && 
                (<Popover
                  open={openPopoverId === todo.id}
                  onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? todo.id : null)}
                  modal={false}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-200 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none">
                    <Card className="w-full shadow-lg rounded-xl">
                      <CardContent className="w-[190px] py-4 px-4">
                        <p className="mb-4 text-sm">Are you sure you want to delete?</p>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenPopoverId(null)} // closes popover
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              handleDelete(todo.id);
                              setOpenPopoverId(null); // closes popover
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </PopoverContent>
                </Popover>)}


              </div>
            ))}
          </div>
        </CardContent>
      </Card>)}
    </>
  );
};

export default StaffTodoNotifications;
