import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { getDepartment } from "@/redux/slices/deparmentSlice";
import { toast } from "sonner";
import { CreateTicketNotes, DeleteTicketNotes, getTickets, getTicketsNotes } from "@/redux/slices/TicketSlice";
import { Eye, FileText, Loader2, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import FileListPreviewModal from "./FileListPreviewModal";
import { get } from "node:http";
interface UploadedFile {
  id: string;
  name: string;
  size: string;
}
export default function AddNotes({selected}) {
    const [textValue, setTextValue] = useState(``);
      const [Files, setFiles] = useState<UploadedFile[]>([]);
        const fileInputRef = useRef(null);
     const [localLoading, setLocalLoading] = useState(false);
       const { id } = useParams<{ id: string }>();
       
       const notesList = useAppSelector((state)=>state.ticket.TicketNotes) 
       
     const [viewingFile, setViewingFile] = useState(null);
const [isFilePreviewModalOpen, setIsFilePreviewModalOpen] = useState(false);
   const [deleteLoading, setDeleteLoading] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const dispatch = useDispatch<AppDispatch>()
      const departments = useAppSelector((state) => state.departments?.departments);
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
  const user = useAppSelector((state) => state.auth?.user);

       const getdepartmentsList = () => {
    dispatch(getDepartment());
  };

  const handleRemoveFile = (fileId: string) => {
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


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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



   const handleButtonClick = () => {
    fileInputRef.current.click();
  };


  useEffect(()=>{
    getdepartmentsList()
  },[])



    const [notes, setNotes] = useState([
        {
          id: 1,
          name: "Sarah Chen",
          role: "SUPPORT LEAD",
          roleColor: "red",
          timestamp: "March 15, 2024 at 14:30",
          content: "Customer reported intermittent connection issues with the API endpoint. Initial investigation shows possible rate limiting problems. Will need to check the logs from last week to confirm the pattern.",
          isHighlighted: true
        },
        {
          id: 2,
          name: "Marcus Thompson",
          role: "DEVELOPER",
          roleColor: "blue",
          timestamp: "March 14, 2024 at 16:45",
          content: "Reviewed the API logs from March 10-13. Found several instances where the rate limit was exceeded during peak hours. Recommending an increase in the rate limit threshold and implementing better client-side caching.",
          isHighlighted: false
        },
        {
          id: 3,
          name: "Elena Rodriguez",
          role: "PRODUCT MANAGER",
          roleColor: "green",
          timestamp: "March 14, 2024 at 11:20",
          content: "Approved the rate limit increase for the next release. Please document the changes and update the client documentation accordingly. We should also monitor the impact of these changes over the next two weeks.",
          isHighlighted: false
        }
      ]);

       const getTicketNoteseData = async () => {
          try {
            await dispatch(getTicketsNotes(id)).unwrap();
          } catch (error: any) {
            console.error("Error fetching Ticket response:", error);
            toast.error("Error fetching Ticket response: " + (error.error || error));
          }
        };
    
      const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
      const [editContent, setEditContent] = useState("");
    
      const handleEdit = (note: typeof notes[0]) => {
        setEditingNoteId(note.id);
        setEditContent(note.content);
      };
      const handleChange = (event) => {
    setTextValue(event.target.value);
  };

  const [openDialog, setOpenDialog] = useState(false);

  const handleView = (file: any) => {
  setViewingFile(file); // Set the file to be viewed
  setOpenDialog(true); // Open the modal
  toast.info(`Viewing ${file?.file_name || file?.file_path?.substring(file?.file_path?.lastIndexOf("/") + 1)}`);
};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
   const handleSubmit = async (e: React.FormEvent) => {
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
        CreateTicketNotes({ ticketId: id, data: formData })
      ).unwrap();

      setTimeout(() => {
        getTicketNoteseData();
        setLocalLoading(false);
        toast.success("Ticket Submitted Sucessfully");
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

  useEffect(()=>{
    getTicketNoteseData()
  },[selected])
    
      const handleSaveEdit = (id: number) => {
        setNotes(notes.map(note => 
          note.id === id ? { ...note, content: editContent } : note
        ));
        setEditingNoteId(null);
      };
    
      const handleDelete = async(Noteid: number) => {
        try{
          setDeleteLoading(true);
        await dispatch(DeleteTicketNotes({ticketId:id, noteId:Noteid.toString()})).unwrap();
        getTicketNoteseData();
        toast.success("Note deleted successfully");
        getTicketNoteseData();
        }catch (error) {
          console.error("Delete Note Error:", error);
          let errorMessage = "Failed to delete note";
          if (typeof error === "object" && error?.error) {
            errorMessage = error.error;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
          toast.error(errorMessage);
        }finally{
          setDeleteLoading(false);
        }
      };

  return (
    <div id="container">
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
      {canListNotes&&<div className="p-6">
      <div className="">
             {canCreateNotes&& <Textarea
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

            {/* <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-4">
                <Select defaultValue="">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Set Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      departments?.map((department)=>
                      <SelectItem value={department?.id?.toString()}>{department?.name}</SelectItem>
                      
                      )
                    }
                   
                  </SelectContent>
                </Select>
                
                <Select defaultValue="">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Set Assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Set Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Set Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div> */}

           {canCreateNotes&& <div className="mt-6 flex items-center justify-between border-t pt-4">
           
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

        
        </div>
              <div className="flex items-center gap-4">
               
                <Button onClick={handleSubmit} className="highlight-button">{
                  localLoading?<span className="flex items-center gap-1">Adding <Loader2 size={12} className="animate-spin"/></span>:<span>Add Note</span>
                  }</Button>
              </div>
            </div>}

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Previous Notes</h2>
              
              {notesList?.map(note => (
                <div 
                  key={note.id} 
                  className={`border rounded-lg p-4 mb-4 ${note.user?.role?.access_control=="Admin_level" ? 'bg-[#ea384c]/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-primary">{note.user?.username}</span>
                      <span className="mx-2 text-card-foreground">•</span>
                      <span className={`text-sm ${note.user?.role?.access_control=="Admin_level"?"bg-red-100":"bg-green-100"} text-${note.user?.role?.access_control=="Admin_level"?"red":"green"}-600 px-2 py-1 rounded`}>
                        {note.user?.role?.name}
                      </span>
                        <p className="text-xs text-gray-500 my-1">Posted : {new Date(note.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                    
                      <div className="flex gap-1">
                        {/* <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(note)}
                        >
                          Edit
                        </Button> */}
                       {(canDeleteNotes&&(Number(localStorage.getItem("userid"))==note.user?.ID)||user?.role?.access_control=="Admin_level") && <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                        >
                          {deleteLoading?<span className="flex gap-1 items-center">Deleting<span><Loader2 className="animate-spin"/></span></span>:"Delete"}
                        </Button>}
                      </div>
                    </div>
                  </div>
                  
                    <div>
                    <p className="text-card-foreground mt-2">{note.description}</p>
                     
                    <div className="space-y-2 mt-4 w-full">
                      {note.files?.length > 0 ? (
                        note.files?.map((file: any) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-white/60 w-full"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {file.file_name}
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

                              <FileListPreviewModal
                                file={viewingFile}
                                open={openDialog}
                                setOpen={setOpenDialog}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">
                        </p>
                      )}
                    </div>
                    </div>
                </div>))}
            </div>
    </div>}
    </div>
  );

}
