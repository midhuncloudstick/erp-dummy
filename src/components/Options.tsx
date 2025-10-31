import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function Options({selected}) {
  return (
    <div className=" py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="bg-background rounded-xl shadow-md">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Department</Label>
                  <Select defaultValue="technical-support">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical-support">
                        Technical Support
                      </SelectItem>
                      <SelectItem value="customer-service">
                        Customer Service
                      </SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Subject</Label>
                  <Input
                    defaultValue="I dont have access to DB unlistened_podplayer_res"
                    className="flex-1"
                  />
                </div>

                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Status</Label>
                  <Select defaultValue="customer-reply">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer-reply">
                        Customer-Reply
                      </SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">CC Recipients</Label>
                  <Input placeholder="None" className="flex-1" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Client Name</Label>
                  <Select defaultValue="gianluca">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gianluca">
                        Gianluca Tiengo cs - #32
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Assigned To</Label>
                  <Select defaultValue="none">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="jane">Jane Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Priority</Label>
                  <Select defaultValue="high">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-4">
                  <Label className="w-32 pt-2 text-right">Merge Ticket</Label>
                  <div className="flex-1 flex gap-2 items-center">
                    <Input
                      placeholder="Enter ticket number"
                      className="flex-1"
                    />
                    <span className="text-gray-500">(# to combine)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-2 justify-center">
              <Button
                variant="default"
                className="highlight-button"
              >
                Save Changes
              </Button>
              <Button variant="outline">Cancel Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
