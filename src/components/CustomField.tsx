
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomFields({selected}) {
  return (
    <div className=" py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="bg-background rounded-xl shadow-md">
          
          <div className="p-6">
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-[200px,1fr] items-center gap-4">
                <span className="text-right text-gray-600">Field1</span>
                <Input defaultValue="Contabo" />
              </div>

              <div className="grid grid-cols-[200px,1fr] items-center gap-4">
                <span className="text-right text-gray-600">Field2</span>
                <Input defaultValue="194.163.187.105" />
              </div>

              <div className="grid grid-cols-[200px,1fr] items-center gap-4">
                <span className="text-right text-gray-600">Field3</span>
                <Input />
              </div>

              <div className="grid grid-cols-[200px,1fr] items-center gap-4">
                <span className="text-right text-gray-600">Field4</span>
                <Input />
              </div>

              <div className="grid grid-cols-[200px,1fr] items-center gap-4">
                <span className="text-right text-gray-600">Field5</span>
                <Select defaultValue="option1">
                  <SelectTrigger>
                    <SelectValue placeholder="I am allowing Technical Support agent to login my server" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">I am allowing Technical Support agent to login my server</SelectItem>
                    <SelectItem value="option2">I am not allowing Technical Support agent to login my server</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <Button className="highlight-button">Save Changes</Button>
                <Button variant="outline">Cancel Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
