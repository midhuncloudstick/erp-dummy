import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import {
  Download,
  Eye,
  Plus,
  ListTodo,
  Settings,
  FileText,
  History,
  MessageSquarePlus,
  X,
  Loader2
} from "lucide-react";
import AdminLayout from "@/layout/pages/AdminMainLayout";
import { useEffect, useRef, useState } from "react";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  CreateTicketResponse,
  DeleteTicketResponse,
  getTicketsResponse
} from "@/redux/slices/TicketSlice";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import FileActions from "./FileActions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui/tooltip";
import FilePreviewModal from "./FilePreviewModal";
import FileListPreviewModal from "./FileListPreviewModal";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

export default function AddReply({ selected }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const responseData = useAppSelector((state) => state.ticket.TicketResponse);
  const [textValue, setTextValue] = useState(``);
  const [Files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);
  const [DeletingResponse, setDeletingResponse] = useState(null);
  const [Fileopen, setFileOpen] = useState("");
  const currentUser = useAppSelector((state) => state.auth.user);
  const [viewingFile, setViewingFile] = useState(null);
  const [isFilePreviewModalOpen, setIsFilePreviewModalOpen] = useState(false);
  const permissions = useAppSelector((state) => state.permission?.permissions);
  const canCreateTicket = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can create support ticket"
  )?.permission;
  const canDeleteTicket = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can delete timesheet"
  )?.permission;
  const canListicket = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can list support tickets"
  )?.permission;
  const canViewTicket = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can view support ticket"
  )?.permission;
  const canUpdateTicket = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can update support ticket"
  )?.permission;
  const canListNotes = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can list notes under ticket"
  )?.permission;
  const canCreateResponse = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can create response under ticket"
  )?.permission;
  const canDeleteResponse = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can delete response under ticket"
  )?.permission;
  const canCreateNotes = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can create notes under ticket"
  )?.permission;
  const canDeleteNotes = permissions["Support Ticket Management"]?.find(
    (permission) => permission?.Permissions.name === "can delete notes under ticket"
  )?.permission;
  const apiBaseUrl = import.meta.env.VITE_VUE_APP_DEV_URL;


  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const getTicketResponseData = async () => {
    try {
      await dispatch(getTicketsResponse(id)).unwrap();
    } catch (error) {
      console.error("Error fetching Ticket response:", error);
      toast.error("Error fetching Ticket response: " + (error.error || error));
    }
  };

  function formatTicketDate(isoString) {
    // Convert to Indian time (IST)
    const date = new Date(isoString);
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    };

    const timeString = date.toLocaleTimeString("en-IN", options);

    // Check if date is today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const diffDays = Math.floor(
      (today.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return `Posted today at ${timeString}`;
    } else if (diffDays === 1) {
      return `Posted yesterday at ${timeString}`;
    } else {
      // For older dates, show full date with time
      const dateOptions = {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric"
      };
      const dateString = date.toLocaleDateString("en-IN", dateOptions);
      return `Posted on ${dateString} at ${timeString}`;
    }
  }

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB"
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles((prev) => {
      const updated = prev.filter((file) => file.id !== fileId);

      // Find the file that was removed (to match with uploadedFiles)
      const removedFile = prev.find((file) => file.id === fileId);

      if (removedFile) {
        setUploadedFiles((prevUploaded) =>
          prevUploaded.filter(
            (f) =>
              !(
                f.name === removedFile.name &&
                (f.size / 1024).toFixed(2) + " KB" === removedFile.size
              )
          )
        );
      }

      return updated;
    });
  };

  const [openDialog, setOpenDialog] = useState(false);

  const handleView = (file) => {
    setViewingFile(file); // Set the file to be viewed
    setIsFilePreviewModalOpen(true); // Open the modal
    toast.info(`Viewing ${file?.file_name || file?.file_path?.substring(file?.file_path?.lastIndexOf("/") + 1)}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  function FormattedMessage({ text }) {
    return (
      <div
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "monospace" // Optional: makes whitespace more visible
        }}
      >
        {text}
      </div>
    );
  }

  const handleDownload = async (fileName, fileUrl) => {
    toast.info(`Attempting to download ${fileName}`);

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the URL
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${fileName}: ${error.message}`);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      const formData = new FormData();
      const data = {
        description: textValue
      };

      formData.append("data", JSON.stringify(data));

      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await dispatch(
        CreateTicketResponse({ ticketId: id, data: formData })
      ).unwrap();

      setTimeout(() => {
        getTicketResponseData();
        setLocalLoading(false);
        toast.success("Ticket Submitted Successfully");
        setTextValue("");
        setFiles([]);
        setUploadedFiles([]);
        // navigate(`/issues/${response?.message?.ID}`);
      }, 2000);
    } catch (error) {
      console.error(`Failed to create Ticket "`, error);

      // Optional: if you want to show the error toast here instead of in onDragEnd
      toast.error("Ticket creation Failed", {
        description: error?.error || "An unexpected error occurred."
      });
      setLocalLoading(false);
      setTextValue("");
      setFiles([]);
      setUploadedFiles([]);
    }
  };

  const handleDelete = async (e, responseId) => {
    e.preventDefault();
    try {
      setDeletingResponse(responseId);

      setDeleteLoading(true);

      await dispatch(
        DeleteTicketResponse({ ticketId: id, responseId: responseId })
      ).unwrap();
      setTimeout(() => {
        setDeleteLoading(false);
        getTicketResponseData();
      }, 2000);
    } catch (error) {
      console.error(`Failed to create Ticket "`, error);

      // Optional: if you want to show the error toast here instead of in onDragEnd
      toast.error("Ticket creation Failed", {
        description: error?.error || "An unexpected error occurred."
      });
      setDeleteLoading(false);
    }
  };

  const handleChange = (event) => {
    setTextValue(event.target.value);
  };

  const handleTicketClick = () => {
    window.location.href =
      "https://preview--support-sparkle-ui.lovable.app/ticket/JTE-970926";
  };

  useEffect(() => {
    getTicketResponseData();
  }, [id]);

  return (
    <div id="container">
      <div>
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
        {/* Content */}
        <div className="p-6">
          {canCreateResponse && <Textarea
            className="min-h-[300px] text-base leading-relaxed"
            placeholder="Type your message here..."
            value={textValue}
            onChange={handleChange}
          />}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="border rounded-lg divide-y">
                {Files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-sm text-gray-500">{file.size}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {canCreateResponse && <div className="border-t border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              {/* Hidden file input */}
              <input
                id="files"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden" // Hide the input
                ref={fileInputRef}
              />

              {/* Button that triggers file input */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleButtonClick}
                  type="button"
                >
                  📎 Attach Files
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Return to Ticket List</span>
              </label> */}
              <Button
                onClick={handleSubmit}
                className="highlight-button"
                size="sm"
              >
                {!localLoading ? (
                  <span>Reply</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Loader2 className="animate-spin" size={12} />
                    <span className="">Submitting</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>}

        {/* Messages Section */}
        <div>
          {responseData?.responses?.map((response) => {
            return (
              <div className="border-b p-6" key={response.id}>
                <div className="flex w-full md:flex-row flex-col-reverse justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-primary">
                        {response?.responder?.username}
                      </span>

                      <span className="px-3 rounded-full my-1 bg-blue-100 text-xs text-blue-700">
                        {response?.responder?.role?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between  w-full gap-2">
                    <span className="text-sm text-gray-500">
                      {formatTicketDate(response?.updated_at)}
                    </span>
                    <div className="flex gap-1">
                      {/* <Button variant="outline" size="sm">
                        Edit
                      </Button> */}
                      {(currentUser?.ID == response?.responder_id ||
                        currentUser?.role?.access_control == "Admin_level") && canDeleteResponse && (
                          <Button
                            onClick={(e) => handleDelete(e, response?.id)}
                            variant="destructive"
                            size="sm"
                          >
                            {!DeleteLoading
                              ? (
                                <span>Delete</span>
                              ) : DeletingResponse !== response?.id ? <span>Delete</span> : (

                                <span className="flex items-center gap-1">
                                  <span>Deleting</span>
                                  <Loader2 className="animate-spin" size={12} />
                                </span>
                              )}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-card-foreground text-left">
                  <div style={{ whiteSpace: "pre-line" }}>
                    {`${response?.description}`}
                  </div>
                  {
                    <div className="space-y-2 w-full">
                      {response?.files?.length > 0 ? (
                        response?.files?.map((file, index) => (
                          <div
                            key={file.ID}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors w-full"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {file?.file_path?.substring(
                                    file?.file_path?.lastIndexOf("/") + 1
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {file.file_size}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground">
                                  {new Date().toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDownload(file.file_name, file.file_path)}
                                      className="h-8 w-8"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Download file</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleView(file, index)}
                                      className="h-8 w-8"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View file</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>



                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild></TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete file</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {Fileopen == index && <FileListPreviewModal
                                file={file}
                                open={openDialog}
                                setOpen={setOpenDialog}
                              />}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500"></p>
                      )}
                    </div>
                  }
                  {/* <div className="mt-6 border rounded-lg divide-y">
                    <div className="p-3 flex items-center justify-between rounded-tl-md rounded-tr-md">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          screenshot-1.png
                        </span>
                        <span className="text-xs text-gray-500">2.4 MB</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between rounded-bl-md rounded-br-md">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          error-log.txt
                        </span>
                        <span className="text-xs text-gray-500">156 KB</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            );
          })}

          {/* Second Message */}
          {responseData?.ticket && (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-primary">
                      {responseData?.ticket?.users?.username}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-xs text-green-700 rounded">
                      {responseData?.ticket?.users?.role?.name}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {responseData?.ticket?.users?.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {formatTicketDate(responseData?.ticket?.last_updated)}
                  </span>
                  {/* <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div> */}
                </div>
              </div>
              <div className="space-y-4 text-card-foreground text-left">
                <p>{responseData?.ticket?.description}</p>
                {/* <div className="mt-6 border rounded-lg divide-y">
                  <div className="p-3 flex items-center justify-between hover:bg-secondary rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        deployment-settings.json
                      </span>
                      <span className="text-xs text-gray-500">4.2 KB</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </div> */}

                {
                  <div className="space-y-2 w-full">
                    {responseData?.ticket?.TicketFiles?.length > 0 ? (
                      responseData?.ticket?.TicketFiles?.map((file, index) => (
                        <div
                          key={file.ID}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors w-full"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {file?.file_path?.substring(
                                  file?.file_path?.lastIndexOf("/") + 1
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(Number(file.fileSize))}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(file.file_name, `${apiBaseUrl}/files/${file.file_path}`)}
                                    className="h-8 w-8"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Download file</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(file)}
                                    className="h-8 w-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View file</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>



                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild></TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete file</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {isFilePreviewModalOpen && viewingFile && (
                              <FileListPreviewModal
                                file={viewingFile}
                                open={isFilePreviewModalOpen}
                                setOpen={setIsFilePreviewModalOpen}
                              />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500"></p>
                    )}
                  </div>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}