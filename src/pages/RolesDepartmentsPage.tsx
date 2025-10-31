import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/store/slices/roleSlice";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/store/slices/roleSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash2, Power } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const RolesDepartmentPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, loading, error, departments,  } = useSelector(
    (state: RootState) => state.roles
  );
  console.log("Roless",roles)

  const [searchTerm, setSearchTerm] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  console.log("newRole",newRole)
  const [openCreateDepartment, setOpenCreateDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", description: "" });

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // --- Handlers ---
  const handleCreateRole = () => {
 try{
     if (!newRole.name.trim()) return alert("Role name is required");
    dispatch(createRole(newRole)).unwrap().then(() => {
      console.log(newRole)
      dispatch(fetchRoles()); // ✅ refresh after create
      setNewRole({ name: "", description: "" });
       toast.success("Role created successfully")
      setOpenCreate(false);
    })
   
 }
 catch(error:any){
  toast.error(error)
 }
  };
  const handleCreateDepartment = () => {
    if (!newDepartment.name.trim()) return alert("Department name is required");
    dispatch(createDepartment(newDepartment)).then(() => {
      dispatch(fetchDepartments());
      toast.success("Departments created successfully") // ✅ refresh after create
      setNewDepartment({ name: "", description: "" });
      setOpenCreateDepartment(false);
    });
  };

  const handleUpdateRole = (
    id: number,
    is_active: boolean,
    name: string,
    description: string
  ) => {
    dispatch(
      updateRole({
        id,
        payload: { name, description, is_active: !is_active },
      })
    ).then(() => {
      dispatch(fetchRoles()); // ✅ refresh after update
    });
  };
  const handleUpdateDepartment = (
    id: number,
    name: string,
    description: string
  ) => {
    dispatch(updateDepartment({ id, payload: { name, description} })).then(() => {
      dispatch(fetchDepartments()); // ✅ refresh after update
    });
  };

  const handleDeleteRole = (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRole(id)).then(() => {
        dispatch(fetchRoles()); // ✅ refresh after delete
      });
    }
  };

  const handleDeleteDepartment = (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      dispatch(deleteDepartment(id)).then(() => {
        dispatch(fetchDepartments()); // ✅ refresh after delete
      });
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      (role?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (role.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  const filteredDepartments = departments.filter(
    (department) =>
      (department?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (department.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Roles & Departments">
    
    
      <div className="p-6 space-y-6">
        {/* 🔍 Search + ➕ Add Role */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Roles</h1>
          <div className="flex flex-row justify-end items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add Role Modal */}
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Role Name"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setOpenCreate(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

   

        {/* 🌀 Loading + ❌ Error */}
        {loading && (
          <div className="text-sm text-gray-500">Loading roles...</div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* 📋 Table */}
        {!loading && !error && (
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role?.id}>
                  <TableCell>{role?.id}</TableCell>
                  <TableCell>{role?.name}</TableCell>
                  <TableCell>{role?.description}</TableCell>
                  <TableCell>
                    {role?.is_active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateRole(
                                role.id,
                                role.is_active,
                                role.name,
                                role.description || ""
                              )
                            }
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{role?.is_active ? "Deactivate" : "Activate"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Role</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
             {/* 📊 Status */}
             <div className="text-sm text-gray-600">
          Showing {filteredRoles.length} of {roles.length} roles
        </div>
      </div>


      {/* Departments */}
      <div className="p-6 space-y-6">
        {/* 🔍 Search + ➕ Add Department */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Departments</h1>
          <div className="flex flex-row justify-end items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add Role Modal */}
          <Dialog open={openCreateDepartment} onOpenChange={setOpenCreateDepartment}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Department Name"
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={newDepartment.description}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setOpenCreateDepartment(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateDepartment}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

   

        {/* 🌀 Loading + ❌ Error */}

        {loading && (
          <div className="text-sm text-gray-500">Loading departments...</div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* 📋 Table */}
        {!loading && !error && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                {/* <TableHead>Status</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.id}</TableCell>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  {/* <TableCell>
                    {department.is_active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        Inactive
                      </span>
                    )}
                  </TableCell> */}
                  <TableCell className="text-right flex gap-2 justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateDepartment(
                                department.id,
                                department.name,
                                department.description || ""
                              )
                            }
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {/* <p>{department.is_active ? "Deactivate" : "Activate"}</p> */}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDepartment(department.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Department</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
             {/* 📊 Status */}
             <div className="text-sm text-gray-600">
          Showing {filteredDepartments.length} of {departments.length} departments
        </div>
      </div>
    </AdminLayout>
  );
};

export default RolesDepartmentPage;
