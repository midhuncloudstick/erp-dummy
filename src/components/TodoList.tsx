import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Clock,
  Repeat,
  Calendar,
  Trash2,
  Info,
  Edit,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CreateTodoDialog from "./CreateTodoDialog";
import {
  createTodo,
  deleteTodo,
  fetchStaffView,
  fetchTodoList,
  GetAssignStaff,
  TodoItem,
  toggleCompleteToPending,
  toggleTodoStatus,
  updateTodoList,
  fetchAssignedTodoList,
  fetchCompletedTodos,
} from "@/store/slices/todoListSlice";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import StatusLog from "./StatusLog"; // Import the StatusLog component
import EditTodoDialog from "./EditTodoDialog";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import StaffTodoNotifications from "./StaffTodoNotifications";

const TodoList = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { items: todos, assignedTodos, loading, completed } = useSelector(
    (state: RootState) => state.todoList
  );
  console.log("completed", completed)

  useEffect(() => {
    console.log('the assined', assignedTodos);

  }, [assignedTodos])

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  console.log("userIDDDD", userId)

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { assignedStaff } = useSelector((state: RootState) => state.todoList);
  console.log("assignstaff", assignedStaff)
  // State for the Status Log Modal
  const [showStatusLog, setShowStatusLog] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [todoFilter, setTodoFilter] = useState<"created" | "assigned">("assigned");
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [createdOpen, setCreatedOpen] = useState(false);
  const [assignedOpen, setAssignedOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);



  useEffect(() => {
    if (todoFilter === "assigned") {
      dispatch(fetchAssignedTodoList());
    } else {
      dispatch(fetchTodoList());
    }
  }, [dispatch, todoFilter]);






  const handleOpenLog = (todoId: number | undefined) => {
    if (todoId) {
      setSelectedTodoId(todoId);
      setShowStatusLog(true);
    }
  };

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

    dispatch(fetchStaffView(userId));

    dispatch(GetAssignStaff());

    getTodoList()

    getAssignedTodoList()

    getCompletedTodoList(userId)

  }, [dispatch]);


  useEffect(() => {
    if (todoFilter === "assigned") {
      getCompletedTodoList(userId);
    }
  }, [todoFilter]);


  const handleDelete = async (id: number | undefined) => {
    if (typeof id === "number") {
      await dispatch(deleteTodo(id));
      getTodoList()
    } else {
      toast.error("Invalid todo ID");
    }
  };

  const handleCreateTodo = async (todo: TodoItem) => {
    try {
      await dispatch(createTodo(todo)).unwrap();
      getTodoList()
      getAssignedTodoList()
      setShowCreateDialog(false)
      toast.success("Todo created successfully!")
    }
    catch (error: any) {
      // console.error(error,"handlecraetetodo");
      toast.error(error)
    }
  };

  const handleEdit = async (id: number, updatedTodo: Partial<TodoItem>) => {
    if (!user?.id) {
      toast.error("User ID is missing.");
      return;
    }

    try {
      const payload: Partial<TodoItem> = {
        id: id,
        task_title: updatedTodo.task_title || "",
        description: updatedTodo.description || "",
        task_type: updatedTodo.task_type || "OneTime",
        due_date: updatedTodo.due_date
          ? new Date(updatedTodo.due_date).toISOString()
          : null,
        recurring_frequency: updatedTodo.recurring_frequency || null,
        time_of_day: updatedTodo.time_of_day || null,
        day_of_week: updatedTodo.day_of_week || null,
        day_of_month: updatedTodo.day_of_month || null,
        month_of_year: updatedTodo.month_of_year || null,
        assign_to_staff: Number(updatedTodo.assign_to_staff) || null, // <-- convert to number
        assignee_name: updatedTodo.assignee_name || "",
        status: updatedTodo.status || "Pending",
      };


      // Dispatch the update
      await dispatch(
        updateTodoList({
          userId: user.id,
          id: id.toString(),
          updatedTodo: payload,
        })
      ).unwrap(); // make sure to call unwrap() as a function

      console.log("Payload sent to backend:", payload);

      // Refresh the todo list
      getTodoList();
      toast.success("Todo updated successfully!");
    } catch (err) {
      console.error("Failed to update todo:", err);
      toast.error("Failed to update todo");
    }
  };


  const handleOpenEditDialog = (todo: TodoItem) => {
    setEditingTodo(todo);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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


  const createdTodos = todos?.filter((t) => t.status === "Created") || []
  console.log("CreatedTodosss", createdTodos)





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


      getTodoList()
      getAssignedTodoList()
      getCompletedTodoList(userId)

    } catch (error) {
      console.log(error);
      toast.error("There was an error toggling the todo status.");
    }
  };



  return (
    <>
      <StaffTodoNotifications todoFilter={todoFilter} />


      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                To-Do List
              </CardTitle>

              <div className="inline-block">
                <ToggleGroup
                  type="single"
                  value={todoFilter}
                  onValueChange={(value: "created" | "assigned") => setTodoFilter(value)}
                  className="h-10 bg-gray-100 border border-gray-300 rounded-md overflow-hidden flex"
                >
                  <ToggleGroupItem
                    value="created"
                    aria-label="Toggle Created"
                    className="flex-1 flex justify-center items-center px-4 text-sm font-medium text-gray-700 transition-colors duration-200 cursor-pointer
  data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                  >
                    Created
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="assigned"
                    aria-label="Toggle Assigned"
                    className="flex-1 flex justify-center items-center px-4 text-sm font-medium text-gray-700 transition-colors duration-200 cursor-pointer
  data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                  >
                    Assigned
                  </ToggleGroupItem>
                </ToggleGroup>


              </div>
            </div>


            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            // className="border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            {/* Created Tasks */}
            {todoFilter === "created" && todos.length > 0 && (
              <Collapsible open={createdOpen} onOpenChange={setCreatedOpen}>
                <CollapsibleTrigger asChild>
                  {todos.filter((t) => t.status === "Created").length > 0 && (
                    <div className="flex justify-between items-center cursor-pointer mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Created ({todos.filter((t) => t.status === "Created").length})
                      </h4>

                      {createdOpen ? (
                        <Button className="bg-transparent text-black hover:bg-gray-50">
                          Collapse <ChevronUp className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="bg-transparent text-black hover:bg-gray-50">
                          Expand <ChevronDown className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}

                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2">
                    {todos?.filter((todo) => todo.status === "Created").map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={todo.status === "Completed"}
                          onChange={() => handleClickBox(todo)}
                          className="mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{todo.task_title}</p>
                            {todo.recurring_frequency && (
                              <Badge variant="outline" className="text-xs dark:text-black">
                                {todo.recurring_frequency}
                              </Badge>
                            )}
                          </div>
                          {todo.description && (
                           <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">  {todo.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {todo.task_type === "Recurring" ? (
                              <>
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  {getRecurringLabel(todo)}
                                </Badge>
                                <div className="text-sm font-medium text-gray-900">
                                  Assigned To:{" "}
                                  {assignedStaff?.find((staff) => staff.id === todo.assign_to_staff)?.full_name}
                                </div>
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Due Date: {formatDate(todo?.next_due_date)}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  One-time
                                </Badge>
                                {todo.due_date && (
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Due Date {formatDate(todo.due_date)}
                                  </Badge>
                                )}
                                <div className="text-sm font-medium text-gray-900">
                                  Assigned To:{" "}
                                  {assignedStaff?.find((staff) => staff.id === todo.assign_to_staff)?.full_name}
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(todo.created_at)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTodo(todo)}
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLog(todo.id)}
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Info className="h-4 w-4" />
                          </Button>

                          <Popover
                            open={openPopoverId === todo.id}
                            onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? todo.id : null)}
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
                                      onClick={() => setOpenPopoverId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        handleDelete(todo.id);
                                        setOpenPopoverId(null);
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}


            {/* Assigned Tasks */}
            {todoFilter === "assigned" && assignedTodos?.length > 0 && (
              <Collapsible open={assignedOpen} onOpenChange={setAssignedOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex justify-between items-center cursor-pointer mb-2">
                    {assignedTodos?.some((t) => t.status === "Created") && (
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Created ({assignedTodos?.filter((t) => t.status === "Created").length})
                      </h4>
                    )}

                    {assignedTodos?.filter((t) => t.status === "Created").length > 0 &&
                      (assignedOpen ? (
                        <Button className="bg-transparent text-black hover:bg-gray-50 flex items-center gap-1">
                          Collapse <ChevronUp className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="bg-transparent text-black hover:bg-gray-50 flex items-center gap-1">
                          Expand <ChevronDown className="h-4 w-4" />
                        </Button>
                      ))}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2">
                    {assignedTodos
                      .filter((todo) => todo.status === "Created")
                      .map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <input
                            type="checkbox"
                            checked={todo.status === "Completed"}
                            onChange={() => handleClickBox(todo)}
                            className="mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{todo.task_title}</p>
                              {todo.recurring_frequency && (
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  {todo.recurring_frequency}
                                </Badge>
                              )}
                            </div>

                            {todo.description && (
                              <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">  {todo.description}</p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              {todo.task_type === "Recurring" ? (
                                <>
                                  <Badge variant="outline" className="text-xs dark:text-black">
                                    <Repeat className="h-3 w-3 mr-1" />
                                    {getRecurringLabel(todo)}
                                  </Badge>

                                  <div className="text-sm font-medium text-gray-900">
                                    {userId === todo.assign_to_staff ? (
                                      <>Assigned By: {assignedStaff?.find((s) => s.id === todo.created_by)?.full_name || "Unknown"}</>
                                    ) : (
                                      <>Assigned To: {assignedStaff?.find((s) => s.id === todo.assign_to_staff)?.full_name || "Not Assigned"}</>
                                    )}
                                  </div>

                                  <Badge variant="outline" className="text-xs dark:text-black">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Due Date: {formatDate(todo?.next_due_date)}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline" className="text-xs dark:text-black">
                                    <Clock className="h-3 w-3 mr-1" />
                                    One-time
                                  </Badge>

                                  {todo.due_date && (
                                    <Badge variant="outline" className="text-xs dark:text-black">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Due Date: {formatDueDate(todo.due_date)}
                                    </Badge>
                                  )}

                                  <div className="text-sm font-medium text-gray-900">
                                    {userId === todo.assign_to_staff ? (
                                      <>Assigned By: {assignedStaff?.find((s) => s.id === todo.created_by)?.full_name || "Unknown"}</>
                                    ) : (
                                      <>Assigned To: {assignedStaff?.find((s) => s.id === todo.assign_to_staff)?.full_name || "Not Assigned"}</>
                                    )}
                                  </div>

                                  <p className="text-sm font-medium text-gray-900">{formatDate(todo.created_at)}</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTodo(todo)}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="Edit todo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLog(todo.id)}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="View status log"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}





            {/* Pending Tasks */}
            {(todoFilter === "created" ? todos : assignedTodos).filter((t) => t.status === "Pending").length > 0 && (
              <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex justify-between items-center cursor-pointer mb-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Pending ({
                        (todoFilter === "created" ? todos : assignedTodos)
                          .filter((t) => t.status === "Pending")
                          .length
                      })
                    </h4>

                    {(todoFilter === "created" ? todos : assignedTodos).filter((t) => t.status === "Pending").length > 0 && (
                      pendingOpen ? (
                        <Button className="bg-transparent text-black hover:bg-gray-50 flex items-center gap-1">
                          Collapse <ChevronUp className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="bg-transparent text-black hover:bg-gray-50 flex items-center gap-1">
                          Expand <ChevronDown className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2">
                    {(todoFilter === "created" ? todos : assignedTodos)
                      .filter((t) => t.status === "Pending")
                      .map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <input
                            type="checkbox"
                            checked={todo.status === "Completed"}
                            onChange={() => handleClickBox(todo)}
                            className="mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{todo.task_title}</p>
                              {todo.recurring_frequency && (
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  {todo.recurring_frequency}
                                </Badge>
                              )}
                            </div>

                            {todo.description && (
                            <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">  {todo.description}</p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              {todo.task_type === "Recurring" ? (
                                <>
                                  <Badge variant="outline" className="text-xs dark:text-black">
                                    <Repeat className="h-3 w-3 mr-1" />
                                    {getRecurringLabel(todo)}
                                  </Badge>

                                  <div className="text-sm font-medium text-gray-900">
                                    {userId === todo.assign_to_staff ? (
                                      <>Assigned By: {assignedStaff?.find((s) => s.id === todo.created_by)?.full_name || "Unknown"}</>
                                    ) : (
                                      <>Assigned To: {assignedStaff?.find((s) => s.id === todo.assign_to_staff)?.full_name || "Not Assigned"}</>
                                    )}
                                  </div>

                                  <Badge variant="outline" className="text-xs dark:text-black">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Due Date: {formatDate(todo?.next_due_date)}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline" className="text-xs dark:text-black">
                                    <Clock className="h-3 w-3 mr-1" />
                                    One-time
                                  </Badge>

                                  {todo.due_date && (
                                    <Badge variant="outline" className="text-xs dark:text-black">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Due Date: {formatDueDate(todo.due_date)}
                                    </Badge>
                                  )}

                                  <div className="text-sm font-medium text-gray-900">
                                    {userId === todo.assign_to_staff ? (
                                      <>Assigned By: {assignedStaff?.find((s) => s.id === todo.created_by)?.full_name || "Unknown"}</>
                                    ) : (
                                      <>Assigned To: {assignedStaff?.find((s) => s.id === todo.assign_to_staff)?.full_name || "Not Assigned"}</>
                                    )}
                                  </div>

                                  <p className="text-sm font-medium text-gray-900">{formatDate(todo.created_at)}</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTodo(todo)}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="Edit todo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLog(todo.id)}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="View status log"
                            >
                              <Info className="h-4 w-4" />
                            </Button>

                            {todoFilter !== "assigned" && (
                              <Popover
                                open={openPopoverId === todo.id}
                                onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? todo.id : null)}
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
                                          onClick={() => setOpenPopoverId(null)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => {
                                            handleDelete(todo.id);
                                            setOpenPopoverId(null);
                                          }}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}



            {/* Completed Tasks */}
            {completed?.length > 0 && (
              <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex justify-between items-center cursor-pointer mb-2">
                    {completed?.some((t) =>
                      todoFilter === "created"
                        ? t.created_by === userId
                        : t.assign_to_staff === userId
                    ) && (
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Completed ({
                            completed.filter((t) =>
                              todoFilter === "created"
                                ? t.created_by === userId
                                : t.assign_to_staff === userId
                            ).length
                          })
                        </h4>
                      )}

                    {(completed.filter((t) =>
                      todoFilter === "created" ? t.created_by === userId : t.assign_to_staff === userId
                    ).length > 0) && (
                        completedOpen ? (
                          <Button className="bg-transparent text-black hover:bg-gray-50 flex items-center gap-1">
                            Collapse <ChevronUp className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button className="bg-transparent text-black hover:bg-gray-50 flex items-center gap-1">
                            Expand <ChevronDown className="h-4 w-4" />
                          </Button>
                        )
                      )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2">
                    {completed
                      .filter((todo) =>
                        todoFilter === "created"
                          ? todo.created_by === userId
                          : todo.assign_to_staff === userId
                      )
                      .map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 line-through">
                                {todo.task_title}
                              </p>
                              {todo.recurring_frequency && (
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  {todo.recurring_frequency}
                                </Badge>
                              )}
                            </div>
                            {todo.description && (
                              <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">  {todo.description}</p>
                            )}

                            <div className="flex items-center justify-normal gap-2 mt-2">
                              {todo.task_type === "Recurring" ? (
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  {getRecurringLabel(todo)}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs dark:text-black">
                                  <Clock className="h-3 w-3 mr-1" />
                                  One-time
                                </Badge>
                              )}

                              <div className="text-sm font-medium text-gray-900">
                                {userId === todo.assign_to_staff ? (
                                  <>Assigned By: {assignedStaff.find((s) => s.id === todo.created_by)?.full_name || "Unknown"}</>
                                ) : (
                                  <>Assigned To: {assignedStaff.find((s) => s.id === todo.assign_to_staff)?.full_name || "Not Assigned"}</>
                                )}
                              </div>

                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(todo.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTodo(todo)}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="Edit todo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLog(todo.id)}
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              aria-label="View status log"
                            >
                              <Info className="h-4 w-4" />
                            </Button>

                            <Popover
                              open={openPopoverId === todo.id}
                              onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? todo.id : null)}
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
                                        onClick={() => setOpenPopoverId(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          handleDelete(todo.id);
                                          setOpenPopoverId(null);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}




            {(todoFilter === "created"
              ? todos.filter((t) => t.status !== "Completed").length === 0
              : assignedTodos.filter((t) => t.status !== "Completed").length === 0) &&
              completed.filter((t) => t.status === "Completed").length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">
                    No tasks yet. Create your first task!
                  </p>
                </div>
              )}

          </div>
        </CardContent>

        <CreateTodoDialog
          assignedStaff={assignedStaff}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateTodo={handleCreateTodo}
        />

        <StatusLog
          open={showStatusLog}
          onOpenChange={setShowStatusLog}
          todoId={selectedTodoId || 0}
        />

        {editingTodo && (
          <EditTodoDialog
            isOpen={!!editingTodo}
            onClose={() => setEditingTodo(null)}
            todo={editingTodo}
            staffOptions={assignedStaff || []} // Pass the staff data to the dialog
            onEdit={handleEdit}
          />
        )}
      </Card>
    </>
  );
};

export default TodoList;
