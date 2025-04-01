
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Save, Loader2, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface MinutesEditorProps {
  meetingId: string;
  extractedText?: string;
  formattedText?: string;
  uploadedMinutesUrl?: string;
  uploadedMinutesFilename?: string;
  isHost: boolean;
  onSaveMinutes: (text: string) => Promise<void>;
  onUploadMinutes?: (file: File) => Promise<void>;
  onExtractActionItems?: () => Promise<void>;
  onGeneratePdf?: () => Promise<void>;
}

const MinutesEditor: React.FC<MinutesEditorProps> = ({
  meetingId,
  extractedText = '',
  formattedText = '',
  uploadedMinutesUrl,
  uploadedMinutesFilename,
  isHost,
  onSaveMinutes,
  onUploadMinutes,
  onExtractActionItems,
  onGeneratePdf
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(formattedText ? 'formatted' : 'upload');
  const [editedFormattedText, setEditedFormattedText] = useState<string>(formattedText || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isExtractingActions, setIsExtractingActions] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Use the provided onUploadMinutes function or fall back to direct API call
      if (onUploadMinutes) {
        await onUploadMinutes(file);
      } else {
        const response = await api.meetings.uploadMinutes(meetingId, file);
        
        // Check for 202 status to handle async processing response
        if (response && response.success && response.statusCode === 202) {
          toast({
            title: "File uploaded",
            description: response.message || "Processing started. This may take a moment.",
          });
        }
      }
      
      toast({
        title: "File uploaded successfully",
        description: "Your minutes file is being processed.",
      });
      
      // Refresh the meeting data after upload
      window.location.reload();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset the input
    }
  };

  const handleSaveMinutes = async () => {
    try {
      setIsSaving(true);
      await onSaveMinutes(editedFormattedText);
      toast({
        title: "Minutes saved",
        description: "Your meeting minutes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving minutes:', error);
      toast({
        title: "Error saving minutes",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtractActionItems = async () => {
    if (!editedFormattedText.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please add meeting minutes first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsExtractingActions(true);
      
      // Use the provided onExtractActionItems function or fall back to direct API call
      if (onExtractActionItems) {
        await onExtractActionItems();
      } else {
        const actionItems = await api.meetings.extractActionItems(meetingId);
        
        toast({
          title: "Action items extracted",
          description: "AI has processed your meeting minutes and extracted potential action items.",
        });
        
        // Navigate to action items page
        window.location.href = `/meetings/${meetingId}/action-items`;
      }
    } catch (error) {
      console.error('Error extracting action items:', error);
      toast({
        title: "Error extracting action items",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingActions(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!formattedText && !editedFormattedText) {
      toast({
        title: "No content to generate PDF",
        description: "Please add or upload meeting minutes first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingPdf(true);
      
      // Use the provided onGeneratePdf function or fall back to direct API call
      if (onGeneratePdf) {
        await onGeneratePdf();
      } else {
        const response = await api.meetings.generateMeetingPDF(meetingId);
        
        if (response && response.success && response.statusCode === 202) {
          toast({
            title: "PDF generation started",
            description: "Your PDF is being generated and will be available soon.",
          });
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error generating PDF",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Meeting Minutes</CardTitle>
        <div className="flex gap-2">
          {isHost && activeTab === 'formatted' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveMinutes}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExtractActionItems}
                disabled={isExtractingActions || !editedFormattedText}
              >
                {isExtractingActions ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Extract Actions
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf || !editedFormattedText}
              >
                {isGeneratingPdf ? 
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                  <FileDown className="h-4 w-4 mr-2" />
                }
                Generate PDF
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="formatted" disabled={!formattedText && !editedFormattedText}>Formatted Minutes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {uploadedMinutesUrl && uploadedMinutesFilename && (
              <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-synchro-600" />
                    <span className="font-medium">{uploadedMinutesFilename}</span>
                  </div>
                  <Badge variant="outline">Uploaded</Badge>
                </div>
              </div>
            )}
            
            {isHost && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-8 bg-slate-50 dark:bg-slate-900">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="text-lg font-medium mb-1">Upload Minutes</h3>
                <p className="text-sm text-muted-foreground mb-4">Upload a PDF or DOCX file of your meeting minutes</p>
                
                <div className="relative">
                  <input
                    type="file"
                    id="minutes-upload"
                    className="hidden"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('minutes-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {!isHost && !uploadedMinutesUrl && (
              <div className="text-center py-8 text-muted-foreground">
                No meeting minutes have been uploaded yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="formatted">
            {isHost ? (
              <Textarea
                value={editedFormattedText}
                onChange={(e) => setEditedFormattedText(e.target.value)}
                placeholder="No formatted minutes available. Please upload a file or enter minutes manually."
                className="min-h-[300px] font-mono"
              />
            ) : (
              <div className="border rounded-md p-4 min-h-[300px] whitespace-pre-wrap">
                {formattedText || editedFormattedText || "No formatted minutes available."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MinutesEditor;
