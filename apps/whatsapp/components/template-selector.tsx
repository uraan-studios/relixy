"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MetaTemplate } from "@/types/meta"
import useSWR from "swr"

interface TemplateSelectorProps {
  onSelect: (templateName: string | null, params: any[] | null) => void
}

const API_BASE_URL = "http://localhost:8080" // Should be env var
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { data: templates } = useSWR(`${API_BASE_URL}/messages/templates`, fetcher)
  // API returns array directly or { data: [] }? My API returns array directly.
  const templateList: MetaTemplate[] = Array.isArray(templates) ? templates : (templates?.data || [])
  
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("none")
  
  // State for Body Params
  const [bodyParams, setBodyParams] = useState<Record<string, string>>({})
  
  // State for Header Params
  const [headerParams, setHeaderParams] = useState<Record<string, string>>({})
  const [headerMediaUrl, setHeaderMediaUrl] = useState<string>("")

  const selectedTemplate = templateList.find(t => t.name === selectedTemplateName)

  // 1. Analyze Body
  const bodyComponent = selectedTemplate?.components.find((c: any) => c.type === "BODY")
  const bodyText = bodyComponent?.text || ""
  const bodyIndices = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g)).map((m: any) => parseInt(m[1]))
  const maxBodyIndex = bodyIndices.length > 0 ? Math.max(...bodyIndices) : 0
  const bodyParamsNeeded = Array.from({ length: maxBodyIndex }, (_, i) => i + 1)

  // 2. Analyze Header
  const headerComponent = selectedTemplate?.components.find((c: any) => c.type === "HEADER")
  const headerFormat = headerComponent?.format
  const headerText = headerComponent?.text || ""
  
  const headerIndices = Array.from(headerText.matchAll(/\{\{(\d+)\}\}/g)).map((m: any) => parseInt(m[1]))
  const maxHeaderIndex = headerIndices.length > 0 ? Math.max(...headerIndices) : 0
  const headerParamsNeeded = Array.from({ length: maxHeaderIndex }, (_, i) => i + 1)
  
  const isHeaderMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat || "")

  useEffect(() => {
    if (selectedTemplateName === "none" || !selectedTemplate) {
      onSelect(null, null)
      return
    }

    const componentsPayload: any[] = []

    // Construct Header Component Payload
    if (headerComponent) {
      if (headerFormat === "TEXT" && headerParamsNeeded.length > 0) {
        componentsPayload.push({
          type: "header",
          parameters: headerParamsNeeded.map(i => ({
            type: "text",
            text: headerParams[i] || ""
          }))
        })
      } else if (isHeaderMedia && headerMediaUrl) {
        componentsPayload.push({
          type: "header",
          parameters: [{
            type: headerFormat?.toLowerCase(),
            [headerFormat?.toLowerCase() || "image"]: {
              link: headerMediaUrl
            }
          }]
        })
      }
    }

    // Construct Body Component Payload
    if (bodyParamsNeeded.length > 0) {
      componentsPayload.push({
        type: "body",
        parameters: bodyParamsNeeded.map(i => ({
          type: "text",
          text: bodyParams[i] || ""
        }))
      })
    }
    
    if (componentsPayload.length === 0) {
        onSelect(selectedTemplateName, null)
    } else {
        onSelect(selectedTemplateName, componentsPayload)
    }

  }, [selectedTemplateName, bodyParams, headerParams, headerMediaUrl, bodyParamsNeeded.length, headerParamsNeeded.length, selectedTemplate, isHeaderMedia, headerFormat, headerComponent, onSelect])


  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template</Label>
        <Select value={selectedTemplateName} onValueChange={setSelectedTemplateName}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {templateList.map((t) => (
              <SelectItem key={t.id} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && (
        <div className="space-y-4 p-3 bg-muted/50 rounded-md">
            
            {/* Header Params Section */}
            {headerComponent && (
                <div className="space-y-3 pb-2 border-b border-border/50">
                     <h4 className="text-sm font-medium text-foreground">Header</h4>
                     {headerFormat === "TEXT" && headerParamsNeeded.length > 0 && (
                         <div className="space-y-2">
                            {headerParamsNeeded.map(idx => (
                                <div key={`h-${idx}`} className="grid grid-cols-4 items-center gap-2">
                                    <Label className="text-right text-xs">Var {idx}</Label>
                                    <Input 
                                        className="col-span-3 h-8" 
                                        value={headerParams[idx] || ""} 
                                        onChange={(e) => setHeaderParams({...headerParams, [idx]: e.target.value})}
                                        placeholder={`Header Val {{${idx}}}`}
                                    />
                                </div>
                            ))}
                            <p className="text-xs text-muted-foreground italic">{headerText}</p>
                         </div>
                     )}
                     {isHeaderMedia && (
                         <div className="grid grid-cols-4 items-center gap-2">
                            <Label className="text-right text-xs">{headerFormat} URL</Label>
                            <Input 
                                className="col-span-3 h-8" 
                                value={headerMediaUrl} 
                                onChange={(e) => setHeaderMediaUrl(e.target.value)}
                                placeholder={`https://example.com/file.${headerFormat === "IMAGE" ? "jpg" : "pdf"}`}
                            />
                         </div>
                     )}
                </div>
            )}

            {/* Body Params Section */}
            {bodyParamsNeeded.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Body</h4>
                    {bodyParamsNeeded.map(idx => (
                        <div key={`b-${idx}`} className="grid grid-cols-4 items-center gap-2">
                            <Label className="text-right text-xs">Var {idx}</Label>
                            <Input 
                                className="col-span-3 h-8" 
                                value={bodyParams[idx] || ""} 
                                onChange={(e) => setBodyParams({...bodyParams, [idx]: e.target.value})}
                                placeholder={`Body Val {{${idx}}}`}
                            />
                        </div>
                    ))}
                    <p className="text-xs text-muted-foreground italic">
                        {bodyText}
                    </p>
                </div>
            )}
        </div>
      )}
    </div>
  )
}
