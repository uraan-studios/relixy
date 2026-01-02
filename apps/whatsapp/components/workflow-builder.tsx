import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Plus, Save, Settings as SettingsIcon, Play, AlertCircle, Zap } from "lucide-react";
import { MessageNode, InputNode, TriggerNode, ButtonNode } from './workflow/custom-nodes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const initialNodes: Node[] = [];

// ... imports remain same ...

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowSettings, setWorkflowSettings] = useState({
      sessionTimeout: 5,
      resetOnInactivity: true,
      agentName: "Support Bot"
  });

  const nodeTypes = useMemo(() => ({
    message: MessageNode,
    input: InputNode,
    trigger: TriggerNode,
    button: ButtonNode
  }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  
  // Load using SWR or useEffect
  // For prototype: useEffect active workflow
  useEffect(() => {
      const fetchWorkflow = async () => {
          try {
              const res = await fetch('http://localhost:3000/workflows'); // Assumes running on same machine/tunnel
              const data = await res.json();
              if (data.success && data.data && data.data.length > 0) {
                  // Sort by createdAt desc to get latest
                  const sorted = data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  const wf = sorted[0]; 
                  
                  setWorkflowId(wf.id);
                  let parsedNodes = typeof wf.nodes === 'string' ? JSON.parse(wf.nodes) : wf.nodes;
                  
                  // Fix missing position from backend/simulation
                  parsedNodes = parsedNodes.map((n: any) => ({
                      ...n,
                      position: n.position || { x: 0, y: 0 }
                  }));

                  setNodes(parsedNodes);
                  setEdges(typeof wf.edges === 'string' ? JSON.parse(wf.edges) : wf.edges);
                  setWorkflowSettings(s => ({...s, agentName: wf.name}));
                  toast.success("Latest workflow loaded");
              }
          } catch (e) {
              console.error("Failed to load workflow", e);
          }
      };
      fetchWorkflow();
  }, [setNodes, setEdges]);
  

  
  const addNode = (type: string) => {
      const id = `${type}-${Date.now()}`;
      const newNode: Node = {
          id,
          type,
          position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
          data: { 
              label: type === 'message' ? 'New Message' : (type === 'button' ? 'Select an option:' : ''),
              question: type === 'input' ? 'What is your...' : '',
              variable: type === 'input' ? 'var_name' : '',
              triggerKeyword: type === 'trigger' ? 'start' : '',
              options: type === 'button' ? ['Option 1', 'Option 2'] : [],
              onChange: (val: string) => {
                  setNodes((nds) => nds.map((node) => {
                      if (node.id === id) {
                          node.data = { ...node.data, label: val, triggerKeyword: val };
                      }
                      return node;
                  }));
              },
              onQuestionChange: (val: string) => {
                 setNodes((nds) => nds.map((node) => {
                      if (node.id === id) {
                          node.data = { ...node.data, question: val };
                      }
                      return node;
                  }));
              },
              onVariableChange: (val: string) => {
                 setNodes((nds) => nds.map((node) => {
                      if (node.id === id) {
                          node.data = { ...node.data, variable: val };
                      }
                      return node;
                  }));
              },
              onOptionsChange: (newOptions: string[]) => {
                  setNodes((nds) => nds.map((node) => {
                       if (node.id === id) {
                           node.data = { ...node.data, options: newOptions };
                       }
                       return node;
                   }));
              }
          }
      };
      setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
      // Find trigger node
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const triggerKeyword = triggerNode ? (triggerNode.data.triggerKeyword as string) : '';

      if (!triggerKeyword) {
          toast.error("Please add a Trigger node with keywords.");
          return;
      }

      const payload = {
          name: workflowSettings.agentName || "Untitled Agent",
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
          triggerKeyword: triggerKeyword,
          isActive: true
      };

      try {
          const url = workflowId ? `http://localhost:3000/workflows/${workflowId}` : 'http://localhost:3000/workflows';
          const method = workflowId ? 'PUT' : 'POST';
          
          const res = await fetch(url, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Workflow saved & activated!");
              if (data.data.id) setWorkflowId(data.data.id);
          } else {
              toast.error("Failed to save: " + data.error);
          }
      } catch (e) {
          toast.error("Network error while saving");
      }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground">
      <div className="p-4 border-b border-border flex justify-between items-center bg-card shadow-sm z-10">
        <div>
           <h2 className="text-lg font-semibold flex items-center gap-2">
               <span className="bg-primary/10 text-primary p-1 rounded-md"><Play className="h-4 w-4"/></span>
               Agent Workflow Builder
           </h2>
           <p className="text-sm text-muted-foreground">Design your chatbot logic • {nodes.length} nodes</p>
        </div>
        <div className="flex gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><SettingsIcon className="mr-2 h-4 w-4"/> Settings</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Workflow Settings</DialogTitle>
                        <DialogDescription>Configure global settings for this agent workflow.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="timeout" className="text-right">Inactivity Timeout (min)</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input 
                                    id="timeout" 
                                    type="number" 
                                    value={workflowSettings.sessionTimeout} 
                                    onChange={(e) => setWorkflowSettings(s => ({...s, sessionTimeout: parseInt(e.target.value)}))}
                                    className="w-20"
                                />
                                <span className="text-xs text-muted-foreground">Reset session after {workflowSettings.sessionTimeout} min of user inactivity.</span>
                            </div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reset-toggle" className="text-right">Auto Reset</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Switch 
                                    id="reset-toggle" 
                                    checked={workflowSettings.resetOnInactivity}
                                    onCheckedChange={(c) => setWorkflowSettings(s => ({...s, resetOnInactivity: c}))}
                                />
                                <span className="text-xs text-muted-foreground">Enable inactivity reset logic.</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => setNodes([])}><AlertCircle className="mr-2 h-4 w-4"/> Reset</Button>
            <Button size="sm" onClick={() => handleSave()}><Save className="mr-2 h-4 w-4"/> Save Workflow</Button>
        </div>
      </div>
      <div className="flex-1 w-full relative h-[600px] bg-muted/5">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="system"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Panel position="top-left" className="m-4">
             <div className="flex flex-col gap-2">
                 <Button className="shadow-lg bg-yellow-500 hover:bg-yellow-600 text-white" size="sm" onClick={() => addNode('trigger')}><Zap className="mr-2 h-4 w-4"/> Add Trigger</Button>
                 <Button className="shadow-lg" size="sm" onClick={() => addNode('message')}><Plus className="mr-2 h-4 w-4"/> Add Message</Button>
                 <Button className="shadow-lg bg-purple-500 hover:bg-purple-600 text-white" size="sm" variant="secondary" onClick={() => addNode('button')}><Plus className="mr-2 h-4 w-4"/> Add Buttons</Button>
                 <Button className="shadow-lg" size="sm" variant="secondary" onClick={() => addNode('input')}><Plus className="mr-2 h-4 w-4"/> Add Input</Button>
             </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
