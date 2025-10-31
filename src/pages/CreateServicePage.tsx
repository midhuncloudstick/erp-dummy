
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, X, Server, Settings } from 'lucide-react';
import {  Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, createCategory } from '@/store/slices/categorySlice';
import { createService } from '@/store/slices/serviceSlice';

const CreateServicePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Local state
  const [serviceName, setServiceName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [cost, setCost] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [yearlyCost, setYearlyCost] = useState('');
  const [descriptionPoints, setDescriptionPoints] = useState<string[]>(['']);
  const [customFields, setCustomFields] = useState<Array<{
    id: string;
    fieldName: string;
    mandatory: boolean;
    fieldType: 'string' | 'digit' | 'password' | 'select';
    options: string[];
  }>>([]);
  // Redux state
  const { categories, loading: loadingCategories, error: categoryError, creatingCategory } = useAppSelector(
    (state) => state.categories
  );
  const { creatingService, createServiceError } = useAppSelector(
    (state) => state.services
  );

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle category errors
  useEffect(() => {
    if (categoryError) {
      toast.error(categoryError);
    }
  }, [categoryError]);

  // Handle service creation errors
  useEffect(() => {
    if (createServiceError) {
      toast.error(createServiceError);
    }
  }, [createServiceError]);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

  try{
      const result = await dispatch(createCategory({ category: newCategory.trim()})).unwrap();
    
    if (createCategory.fulfilled.match(result)) {
      setCategoryId(result.payload.id.toString());
      setNewCategory('');
    }
    toast.success('Category created successfully');
  }
  catch(error:any){
    console.log(error,"adasda")
    toast.error(error)
  }
  };

  const addDescriptionPoint = () => {
    setDescriptionPoints([...descriptionPoints, '']);
  };

  const removeDescriptionPoint = (index: number) => {
    setDescriptionPoints(descriptionPoints.filter((_, i) => i !== index));
  };

  const updateDescriptionPoint = (index: number, value: string) => {
    const updated = [...descriptionPoints];
    updated[index] = value;
    setDescriptionPoints(updated);
  };
  const addCustomField = () => {
    const newField = {
      id: Date.now().toString(),
      fieldName: '',
      mandatory: false,
      fieldType: 'string' as const,
      options: []
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<typeof customFields[0]>) => {
    setCustomFields(customFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const addOption = (fieldId: string) => {
    updateCustomField(fieldId, {
      options: [...customFields.find(f => f.id === fieldId)?.options || [], '']
    });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field) {
      updateCustomField(fieldId, {
        options: field.options.filter((_, index) => index !== optionIndex)
      });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateCustomField(fieldId, { options: newOptions });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalCategoryId = categoryId;

      // // If creating a new category, create it first
      // if (categoryId === 'new' && newCategory.trim()) {
      //   const result = await dispatch(createCategory({ category: newCategory.trim() })).unwrap();
      //   console.log("resultService",result)
      //   if (createCategory.rejected.match(result)) {
      //     return;
      //   }
      //   finalCategoryId = result.payload.id.toString();
      // }

      // Prepare the service payload
      const servicePayload: any = {
        name: serviceName,
        type: paymentType === 'one-time' ? 'onetime' : 'recurring',
        category_id: parseInt(finalCategoryId),
        features: descriptionPoints.filter(point => point.trim()),
        description: descriptionPoints.filter(point => point.trim()),
        custom_fields: customFields.filter(field => field.fieldName.trim()).map(field => {
          const customField: any = {
            field_name: field.fieldName,
            field_type: field.fieldType,
            is_mandatory: field.mandatory
          };
          
          // Add field_select for select type fields
          if (field.fieldType === 'select' && field.options.length > 0) {
            customField.field_select = field.options.filter(option => option.trim()).map(option => ({
              options: option
            }));
          }
          
          return customField;
        })
      };

      // Add cost based on payment type
      if (paymentType === 'one-time') {
        servicePayload.one_time_cost = cost;
      } else if (paymentType === 'recurring') {
        if (monthlyCost) servicePayload.monthly_cost = monthlyCost;
        if (yearlyCost) servicePayload.yearly_cost = yearlyCost;
      }
      await dispatch(createService(servicePayload)).unwrap();
        toast.success('Service created successfully');
        navigate('/services');
      
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 shadow-xl border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/services')} className="text-white hover:bg-white/10 mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
            <div className="flex items-center">
              <Server className="h-6 w-6 text-white mr-2" />
              <h1 className="text-xl font-semibold text-white">Create New Service</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-gray-900">Service Details</CardTitle>
            <CardDescription>
              Create a new service offering with pricing and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g., Website Setup (Basic)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select or create category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.category}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">Create New Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {categoryId === 'new' && (
                <div className="space-y-2">
                  <Label htmlFor="newCategory">New Category Name *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="newCategory"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategory.trim()}
                    >
                      {creatingCategory ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type *</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One Time Payment</SelectItem>
                    <SelectItem value="recurring">Recurring Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType === 'one-time' && (
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (USD) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="3500.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}

              {paymentType === 'recurring' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyCost">Monthly Cost (USD)</Label>
                    <Input
                      id="monthlyCost"
                      type="number"
                      value={monthlyCost}
                      onChange={(e) => setMonthlyCost(e.target.value)}
                      placeholder="1500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearlyCost">Yearly Cost (USD)</Label>
                    <Input
                      id="yearlyCost"
                      type="number"
                      value={yearlyCost}
                      onChange={(e) => setYearlyCost(e.target.value)}
                      placeholder="15000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Service Features (Bullet Points) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDescriptionPoint}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {descriptionPoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          value={point}
                          onChange={(e) => updateDescriptionPoint(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                        />
                      </div>
                      {descriptionPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDescriptionPoint(index)}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
  {/* Custom Fields Section */}
  <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-gray-900">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    Custom Fields
                  </CardTitle>
                  <CardDescription>
                    Add custom fields that clients need to fill when ordering this service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Service Custom Fields</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomField}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {customFields.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No custom fields added yet. Click "Add Field" to create one.
                      </div>
                    )}

                    {customFields.map((field) => (
                      <Card key={field.id} className="p-4 border border-gray-200">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Field {customFields.indexOf(field) + 1}</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomField(field.id)}
                              className="text-red-600 hover:text-red-700 border-red-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`fieldName-${field.id}`}>Field Name *</Label>
                              <Input
                                id={`fieldName-${field.id}`}
                                value={field.fieldName}
                                onChange={(e) => updateCustomField(field.id, { fieldName: e.target.value })}
                                placeholder="e.g., Domain Name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`fieldType-${field.id}`}>Field Type *</Label>
                              <Select 
                                value={field.fieldType} 
                                onValueChange={(value: 'string' | 'digit' | 'password' | 'select') => 
                                  updateCustomField(field.id, { fieldType: value, options: value === 'select' ? [''] : [] })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">Text (String)</SelectItem>
                                  <SelectItem value="digit">Number (Digit)</SelectItem>
                                  <SelectItem value="password">Password</SelectItem>
                                  <SelectItem value="select">Selection (Dropdown)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2 pt-7">
                              <Checkbox
                                id={`mandatory-${field.id}`}
                                checked={field.mandatory}
                                onCheckedChange={(checked) => 
                                  updateCustomField(field.id, { mandatory: checked === true })
                                }
                              />
                              <Label htmlFor={`mandatory-${field.id}`} className="text-sm">
                                Mandatory Field
                              </Label>
                            </div>
                          </div>

                          {field.fieldType === 'select' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Selection Options</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(field.id)}
                                  className="border-green-200 text-green-600 hover:bg-green-50"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                              
                              {field.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  {field.options.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeOption(field.id, optionIndex)}
                                      className="text-red-600 hover:text-red-700 border-red-200"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/services')}
                  disabled={creatingService}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={creatingService}
                >
                  {creatingService ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Service...
                    </>
                  ) : (
                    'Create Service'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateServicePage;
