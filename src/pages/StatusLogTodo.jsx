import React, { useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Logs, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';



function StatusLogTodo() {

    const [searchTerm, setSearchTerm] = useState('');
    
    return (

        <>
            <AdminLayout
                title="Todo Status logs"
                subtitle="Manage all your task logs and their information in one place"

            >
                <div className='p-6 space-y-6'>
                    <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white mb-2">
                         <Logs className='h-6 w-6 mr-3 '/>
                         Task Status Histroy
                        </CardTitle>
                  <div className='flex items-center space-x-2 mt-4'>
                    <div className='relative flex-1 max-w-sm'>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                        placeholder ="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        />
                    </div>
                  </div>

                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                       <div className='flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors'>
                       <p className='text-sm'></p>
                       <div className='space-y-1 flex-1'>
                        <p className='text-sm'></p>
                        <p className='text-xs text-muted-foreground'></p>
                       </div>


                       </div>
                    </CardContent>
                    </Card>

                </div>









            </AdminLayout>









































        </>
    )
}

export default StatusLogTodo