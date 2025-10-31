import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ChevronRight, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useAppSelector } from "@/store/hooks";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [project, setProject] = useState("");
  const [department, setDepartment] = useState("");
  const [Files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const projectData = useAppSelector((state) => state);

  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    undefined
  );
  const [selectedSubTaskId, setSelectedSubTaskId] = useState<
    string | undefined
  >(undefined);

  const principles = [
    {
      id: "1",
      name: "Foundation Work",
      status: "in_progress" as const,
      taskCost: "75000",
      priority: "High" as const,
      description: "Complete the foundation work for the main building",
      assignees: ["John Doe", "Mike Smith"],
      startDate: new Date("2024-03-01").toISOString(),
      endDate: new Date("2024-03-15").toISOString(),
      timeType: "days" as const,
      timeValue: "15",
      thumbnail:
        "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=800"
    },
    {
      id: "2",
      name: "Electrical Wiring",
      status: "not_started" as const,
      taskCost: "50000",
      priority: "Medium" as const,
      description: "Install electrical wiring throughout the building",
      assignees: ["Sarah Johnson"],
      startDate: new Date("2024-03-16").toISOString(),
      endDate: new Date("2024-03-30").toISOString(),
      timeType: "days" as const,
      timeValue: "14",
      thumbnail:
        "https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=800"
    },
    {
      id: "3",
      name: "Plumbing Installation",
      status: "not_started" as const,
      taskCost: "60000",
      priority: "High" as const,
      description: "Complete plumbing work for all floors",
      assignees: ["Robert Wilson"],
      startDate: new Date("2024-03-20").toISOString(),
      endDate: new Date("2024-04-05").toISOString(),
      timeType: "days" as const,
      timeValue: "16",
      thumbnail:
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800"
    }
  ];
  const tasksList = useAppSelector((state) => state);
  const subTaskList = useAppSelector((state) => state);
  const departmentsData = useAppSelector(
    (state) => state
  );
  const [localLoading, setLocalLoading] = useState(false);

    // const getprojectdetial = async () => {
  
    //   try {
    //     await dispatch(getProjectsByid(id)).unwrap();
    //   } catch (error) {
    //     console.error(error);
    //   }
    // };
  
    // useEffect(() => {
    //   getprojectdetial();
    // }, [id]);

  const addedPrinciples = principles.map((p) => p.id); // Adjust this if your added list is dynamic

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      const formData = new FormData();
      const data = {
        subject: subject,
        // task_id: Number(selectedTaskId),
        // subtask_id: Number(selectedSubTaskId),
        description: description,
        department_id: Number(department)
      };

      formData.append("data", JSON.stringify(data));

      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // const response = await dispatch(
      //   CreateTicket({ projectid: Number(id), data: formData })
      // ).unwrap();
      // setTimeout(() => {
      //   setLocalLoading(false);
      //   toast.success("Ticket Submitted Sucessfully");
      //   setSubject("");
      //   setDescription("");
      //   setPriority("");
      //   setSelectedSubTaskId(undefined);
      //   setSelectedTaskId(undefined);
      //   setFiles([])
      //     setUploadedFiles([])
      //   navigate(`/project/${id}/issues/${response?.message?.ID}`);
      // }, 2000);
    } catch (error) {
      console.error(`Failed to create Ticket "`, error);

      // Optional: if you want to show the error toast here instead of in onDragEnd
      toast.error("Ticket creation Failed", {
        description: error?.error || "An unexpected error occurred."
      });
      setLocalLoading(false)
      setSubject("");
      setDescription("");
      setPriority("");
      setSelectedSubTaskId(undefined);
      setSelectedTaskId(undefined);
      setFiles([])
          setUploadedFiles([])
    }
  };

  // const getTaskData = async (limits?: number, pages?: number) => {
  //   try {
  //     const response = await dispatch(
  //       getTasks({ milestoneId: Number(), limit: limits, page: pages })
  //     ).unwrap();
  //   } catch (error: any) {
  //     console.error("Error fetching tasks:", error);
  //     toast.error("Error fetching tasks: " + (error.message || error));
  //   }
  // };

  // const getDepartmentData = async (limits?: number, pages?: number) => {
  //   try {
  //     await dispatch(getDepartment()).unwrap();
  //   } catch (error: any) {
  //     console.error("Error fetching Department:", error);
  //     toast.error("Error fetching Department: " + (error.error || error));
  //   }
  // };

  // const getSubTaskData = async () => {
  //   try {
  //     const response = await dispatch(
  //       getSubTasks({ taskid: Number(selectedTaskId) })
  //     ).unwrap();
  //   } catch (error: any) {
  //     console.error("Error fetching tasks:", error);
  //     toast.error("Error fetching tasks: " + (error.error || error));
  //   }
  // };

  //  const getProjectData = async () => {
  //   try {
  //     await dispatch(getProjectsByid(id)).unwrap();
  //   } catch (error: any) {
  //     console.error("Error fetching ProjectData:", error);
  //     toast.error("Error fetching ProjectData: " + (error.error || error));
  //   }
  // };


  // useEffect(() => {
  //   getTaskData();
  //   getDepartmentData();
  //   if (selectedTaskId) {
  //     getSubTaskData();
  //   }
  // }, [selectedTaskId]);

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4 text-sm">
        <div className="flex items-center">
           <Link to={`/projects/${id}`} className="text-gray-600 hover:text-primary">
            {projectData?.name}
          </Link>

          <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />

          <Link to={`/projects/${id}`} className="text-gray-600 hover:text-primary">
            Issues
          </Link>

          <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />

          <span className="text-primary font-medium">Report Issue</span>
        </div>
      </div>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="bg-card rounded-xl shadow-md p-8">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-3 mb-8">
                <h1 className="text-3xl font-bold bg-gradient-background inline bg-clip-text text-transparent">
                  Report an Issue
                </h1>
                <p className="text-base text-gray-600">
                  Please fill out the form below to submit a new support ticket.
                  We'll respond as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-base">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide a detailed description of your issue"
                    required
                    className="min-h-[200px] text-base leading-relaxed"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="priority" className="text-base">
                      Priority Level
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority" className="h-12">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="department" className="text-base">
                      Department
                    </Label>
                    {/* <SearchableSelect
                      items={[...departmentsData]
                        .sort((a, b) => {

                          return a.name.localeCompare(b.name);
                        })
                        .map((p) => ({
                          id: p.id,
                          label: p.name
                        }))}
                      selectedId={Number(department)}
                      onSelect={(id) => {
                        setDepartment(id?.toString());
                      }}
                      placeholder="select Department"
                      deduplicate={true}
                      widthClass="w-full"
                    /> */}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* <div className="space-y-3">
                  <Label htmlFor="project" className="text-base">Project</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger id="project" className="h-12">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project)=><SelectItem value={project}>{project}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div> */}
                  {/* <div className="">
                    <div className="space-y-3">
                      <Label htmlFor="project" className="text-base">
                        Task
                      </Label>
                      <SearchableSelect
                        items={[...tasksList]?.sort((a, b) => {

                            return a.name.localeCompare(b.name);
                          })
                          .map((p) => ({
                            id: p.ID,
                            label: p.name
                          }))}
                        selectedId={Number(selectedTaskId)}
                        onSelect={(id) => {
                          setSelectedTaskId(id?.toString()); // Replace this with your state updater or logic
                        }}
                        placeholder="select task"
                        deduplicate={true}
                        widthClass="w-full !bg-slate-50"
                      />
                    </div>
                  </div> */}
                  {/* <div className="">
                    <div className="space-y-3">
                      <Label htmlFor="project" className="text-base">
                        SubTask
                      </Label>
                      <SearchableSelect
                        items={[...subTaskList]
                          .sort((a, b) =>
                            a.subtask_name.localeCompare(b.subtask_name)
                          )
                          .map((p) => {

                            return {
                              id: p.ID,
                              label: p.subtask_name
                            };
                          })}
                        selectedId={Number(selectedSubTaskId)}
                        onSelect={(id) => {

                          setSelectedSubTaskId(id?.toString());
                        }}
                        placeholder="select subtask"
                        deduplicate={true}
                        widthClass="!w-full !bg-slate-50"
                        disabled={selectedTaskId == undefined}
                      />
                    </div>
                  </div> */}

                  {/* <div className="space-y-3">
                  <Label htmlFor="regions" className="text-base">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="regions" className="h-12">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                    {regions.map((region)=><SelectItem value={region}>{region}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div> */}
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="files" className="text-base">
                      Attachments
                    </Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="h-12 cursor-pointer"
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base">Uploaded Files</Label>
                      <div className="border rounded-lg divide-y">
                        {Files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium">
                                {file.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {file.size}
                              </span>
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

                <div className="flex items-center space-x-4 pt-4">
                  <Button type="submit" size="lg" className="flex-1 h-12">
                   {!localLoading? <span>Submit Issue</span>:<span className="flex items-center gap-2">Submitting<span><Loader2 className="animate-spin"/></span></span>}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(`/projects/${id}#project-issues`)}
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
