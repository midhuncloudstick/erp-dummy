import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Download,
  Eye,
  Plus,
  ListTodo,
  Settings,
  FileText,
  History,
  MessageSquarePlus,
  ChevronRight,
  Circle,
  Notebook
} from "lucide-react";
import AddReply from "@/components/AddReply";
import { useEffect, useState } from "react";
import AddNotes from "@/components/AddNotes";
import CustomFields from "@/components/CustomField";
// import OtherTickets from "@/components/OtherTickets";
import ClientLog from "@/components/ClientLog";
import Options from "@/components/Options";
import Log from "@/components/Log";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { getDepartment } from "@/redux/slices/deparmentSlice";
import { useAppSelector } from "@/redux/hooks";
import { getTickets, UpdateTicketPriority, UpdateTicketStatus } from "@/redux/slices/TicketSlice";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { Label } from "@/components/ui/label";
// import Header from "@/components/Header";
// import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function TicketDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const departments = useAppSelector((state) => state.departments?.departments);
  const ticketList = useAppSelector((state) => state?.ticket?.Tickets);
  const currentUser = useAppSelector((state) => state.auth.user);
  const userType = useAppSelector((state) => state.auth?.user?.user_type);

  const responseData = useAppSelector((state) => state.ticket.TicketResponse);

  const { id, projectId } = useParams<{ id: string; projectId: string }>();

  const [selectedSection, setSelectedSection] = useState<string>("add-reply");

     const permissions = useAppSelector((state) => state.permission?.permissions);
        const canCreateTicket = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can create support ticket")?.permission
  const canDeleteTicket = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can delete timesheet")?.permission
  const canListicket = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can list support tickets")?.permission
        const canViewTicket = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can view support ticket")?.permission
  const canUpdateTicket = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can update support ticket")?.permission
  const canListNotes = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can list notes under ticket")?.permission
        const canCreateResponse = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can create response under ticket")?.permission
  const canDeleteResponse = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can delete response under ticket")?.permission
  const canCreateNotes = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can create notes under ticket")?.permission
  const canDeleteNotes = permissions["Support Ticket Management"]?.find((permission) => permission?.Permissions.name === "can delete notes under ticket")?.permission


  const getdepartmentsList = () => {
    dispatch(getDepartment());
  };

  function formatTimeSince(isoDate: string): string {
    const createdAt = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - createdAt.getTime()) / 1000
    );

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    return `Last Reply: ${hours} Hours ${minutes} Minutes ${seconds} Seconds Ago`;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getTicketData = async (page?: number) => {
    try {
      const response = await dispatch(
        getTickets({
          projectid: Number(projectId)
        })
      ).unwrap();
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast.error("Error fetching tasks: " + (error.error || error));
    }
  };

  const updateStatus = async (value) => {
    try {
      await dispatch(UpdateTicketStatus({ projectid: projectId, ticketid: id, status: value })).unwrap()
      getdepartmentsList();
      getTicketData();
      toast.success("Status Updated sucessfully")
    } catch (error) {
      console.error(error);

    }
  };

  const updatePriority = async (value) => {
    try {
      await dispatch(UpdateTicketPriority({ projectid: projectId, ticketid: id, priority: value })).unwrap()
      getdepartmentsList();
      getTicketData();
      toast.success("Status Updated sucessfully")
    } catch (error) {
      console.error(error);

    }
  };

  const [ticket, setTicket] = useState<any>()
  useEffect(() => {
    setTicket(ticketList?.find((ticket) => ticket?.ID == id))
  }, [ticketList])
  //console.log("ticket", ticket);
  const defaultStatus = userType === "internal"
    ? ticket?.internal_status ?? "Open"
    : ticket?.external_status ?? "Open";

  useEffect(() => {
    getdepartmentsList();
    getTicketData();
  }, [id, projectId]);

  const handleTicketClick = () => {
    window.location.href =
      "https://preview--support-sparkle-ui.lovable.app/ticket/JTE-970926";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex w-full flex-col">
          <Header />
          <div className="flex-1 md:p-8">

            <div className="!z-10">
              <div className="flex items-center md:space-x-2 mb-4 p-2 md:p-0 text-sm">
                <div className="flex items-center">
                   <Link to={`/projects/${projectId}`} className="text-gray-600 hover:text-primary">
                    PROJECTS
                  </Link>

                  <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />
                  <Link to={`/projects/${projectId}`} className="text-gray-600 hover:text-primary">
                    Issues
                  </Link>

                  <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />

                  <span className="text-primary font-medium">Issue details</span>
                </div>
              </div>
              <div className="min-h-screen py-6">
                <div className="md:container mx-auto md:max-w-6xl px-4">
                  <div className="bg-card rounded-xl shadow-md">
                    {/* Header */}
                    <div className="border-b p-6">
                      <div className="flex flex-col gap-6 md:gap-1 ">
                        <div>
                          <div className="text-left">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <h1
                                    className="text-2xl font-semibold bg-gradient-background bg-clip-text text-transparent cursor-default  transition-colors truncate md:max-w-[600px]"
                                  // onClick={handleTicketClick}
                                  >
                                    {id}-{ticket?.subject}
                                  </h1>
                                </TooltipTrigger>
                                <TooltipContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm text-gray-800 dark:text-gray-200 ">
                                  <p className="m-0 break-words">
                                    {id}-{ticket?.subject}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="text-sm my-1 text-gray-500 block">
                              <span className="Mr-2">Last Reply:</span>{" "}
                              <span>
                                {" "}
                             {formatDate(responseData?.responses?.[0]?.created_at || new Date())}
                              </span>
                            </span>
                          </div>

                          <div className="flex gap-2 md:flex-row md:gap-0 flex-col-reverse items-center justify-between w-full">
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSection("add-reply")}
                                className={`${selectedSection == "add-reply" &&
                                  "bg-primary text-primary-foreground"
                                  } text-[10px] py-1 px-2 md:py-1 md:px-3 md:text-sm`}
                              >
                                <MessageSquarePlus className="h-4 w-4" />
                                Add Reply
                              </Button>
                              {currentUser?.user_type == "internal" && canListNotes&& (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSection("add-notes")}
                                  className={`${selectedSection == "add-notes" &&
                                    "bg-primary text-primary-foreground"
                                    } text-[10px] py-1 px-2 md:py-1 md:px-3 md:text-sm`}
                                >
                                  <Notebook className="h-4 w-4" />
                                  Notes
                                </Button>
                              )}
                              {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSection("custom-fields")}
                      className={`${
                        selectedSection == "custom-fields" &&
                        "bg-primary text-primary-foreground"
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Custom Fields
                    </Button> */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSection("other-tickets")}
                                className={`${selectedSection == "other-tickets" &&
                                  "bg-primary text-primary-foreground"
                                  } text-[10px] py-1 px-2 md:py-1 md:px-3 md:text-sm`}
                              >
                                <ListTodo className="h-4 w-4" />
                                Other Tickets
                              </Button>
                              {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSection("client-log")}
                      className={`${
                        selectedSection == "client-log" &&
                        "bg-primary text-primary-foreground"projectid
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      Client Log
                    </Button> */}
                              {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSection("options")}
                      className={`${
                        selectedSection == "options" &&
                        "bg-primary text-primary-foreground"
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Options
                    </Button> */}
                              {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSection("log")}
                      className={`${
                        selectedSection == "log" &&
                        "bg-primary text-primary-foreground"
                      }`}
                    >
                      <History className="h-4 w-4" />
                      Log
                    </Button> */}
                            </div>

                            {canUpdateTicket&&<div className="flex items-center gap-3">
                              <div className="flex flex-col space-y-1">
                                <Label htmlFor="priority-select" className="text-xs text-muted-foreground">
                                  Priority
                                </Label>
                                <Select onValueChange={updatePriority} value={ticket?.priority}>
                                  <SelectTrigger
                                    id="priority-select"
                                    className="w-[140px] [&>span]:truncate"
                                  >
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Low" className="flex items-center gap-2">
                                      Low
                                    </SelectItem>
                                    <SelectItem value="Medium" className="flex items-center gap-2">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="High" className="flex items-center gap-2">
                                      High
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex flex-col space-y-1">
                                <Label htmlFor="status-select" className="text-xs text-muted-foreground">
                                  Status
                                </Label>
                                <Select onValueChange={updateStatus} value={defaultStatus}>
                                  <SelectTrigger
                                    id="status-select"
                                    className="w-[160px] [&>span]:truncate"
                                  >
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Open" className="flex items-center gap-2">
                                      Open
                                    </SelectItem>
                                    <SelectItem value="On_hold" className="flex items-center gap-2">
                                      On Hold
                                    </SelectItem>
                                    <SelectItem value="In_progress" className="flex items-center gap-2">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="Resolved" className="flex items-center gap-2">
                                      Resolved
                                    </SelectItem>
                                    {/* <SelectItem
                                      value={userType == "internal" ? "Answered" : "Contractor-Reply"}
                                      className="flex items-center gap-2"
                                    >
                                      {userType == "internal" ? "Answered" : "Contractor Reply"}
                                    </SelectItem> */}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editor Toolbar */}
                    {/* <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  B
                </Button>
                <Button variant="outline" size="sm">
                  I
                </Button>
                <Button variant="outline" size="sm">
                  H
                </Button>
                <Button variant="outline" size="sm">
                  🔗
                </Button>
                <Button variant="outline" size="sm">
                  •
                </Button>
                <Button variant="outline" size="sm">
                  1.
                </Button>
                <Button variant="outline" size="sm">
                  =
                </Button>
                <Button variant="outline" size="sm">
                  [ ]
                </Button>
                <Button variant="default" size="sm">
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  ?
                </Button>
              </div>
            </div> */}
                    {/* container */}
                    <div id="container">
                      {selectedSection === "add-reply" && (
                        <AddReply selected={selectedSection} />
                      )}
                      {selectedSection === "add-notes" && (
                        <AddNotes selected={selectedSection} />
                      )}
                      {selectedSection === "custom-fields" && (
                        <CustomFields selected={selectedSection} />
                      )}
                      {selectedSection === "other-tickets" && (
                        <OtherTickets selected={selectedSection} />
                      )}
                      {selectedSection === "client-log" && (
                        <ClientLog selected={selectedSection} />
                      )}
                      {selectedSection === "options" && (
                        <Options selected={selectedSection} />
                      )}
                      {selectedSection === "log" && <Log />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>

  );
}
