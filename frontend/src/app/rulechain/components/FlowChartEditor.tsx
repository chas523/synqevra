import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowRight, Plus, X, Check, Play } from "lucide-react";
import { toast } from "sonner";
import {
  NODE_TYPES,
  FlowNode,
  FlowConnection,
  CONNECTION_TYPES,
  ConnectionType,
  getConnectionsBetweenNodes,
  addConnectionType,
  removeConnectionType,
} from "../types/NodeTypes";
import { NodeConfigurationEditor } from "./NodeConfigurationEditor";
import { medplum } from "@/lib/medplum";
import { Combobox, ComboboxItem } from "../../../components/ui/combobox";
import {
  generateTempId,
  getBearerTokenFromLocalStorage,
  getPatientDisplayName,
  Patient,
} from "../utils";

interface FlowChartEditorProps {
  initialNodes?: FlowNode[];
  initialConnections?: FlowConnection[];
  onSave: (nodes: FlowNode[], connections: FlowConnection[]) => void;
  onCancel: () => void;
}

export const FlowChartEditor = ({
  initialNodes = [],
  initialConnections = [],
  onSave,
  onCancel,
}: FlowChartEditorProps) => {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [connections, setConnections] =
    useState<FlowConnection[]>(initialConnections);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthenticationAndLoadPatients();
  }, []);

  const checkAuthenticationAndLoadPatients = async () => {
    try {
      const authenticated = await medplum.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const patientBundle = await medplum.searchResources("Patient");
        setPatients(patientBundle);
      }
    } catch (error) {
      console.error(
        "Error checking authentication or loading patients:",
        error
      );
    }
  };

  const addNode = (nodeTemplate: any) => {
    try {
      let configuration = { ...nodeTemplate.defaultConfiguration };

      // Add auth header if Rest API Call node
      if (
        nodeTemplate.type ===
        "org.thingsboard.rule.engine.rest.TbRestApiCallNode"
      ) {
        const headers = { ...configuration.headers };
        const token = getBearerTokenFromLocalStorage();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        configuration.headers = headers;
      }

      // If patient exists and Transform Message node, prefill subject
      if (
        selectedPatient &&
        configuration.jsScript &&
        typeof configuration.jsScript === "string"
      ) {
        configuration.jsScript = configuration.jsScript.replace(
          /subject:\s*{[^}]*}/,
          `subject: {
    reference: "Patient/${selectedPatient.id}",
    display: "${getPatientDisplayName(selectedPatient)}"
  }`
        );
      }

      const newNode: FlowNode = {
        id: generateTempId(),
        type: nodeTemplate.type,
        name: `${nodeTemplate.name} ${nodes.length + 1}`,
        configuration,
        position: nodes.length,
      };

      setNodes((prev) => [...prev, newNode]);

      // Auto-connect to previous node if exists
      if (nodes.length > 0) {
        const newConnection: FlowConnection = {
          fromIndex: nodes.length - 1,
          toIndex: nodes.length,
          type: "Success",
        };
        setConnections((prev) => [...prev, newConnection]);
      }

      toast.success(`Added ${nodeTemplate.displayName} node`);
    } catch (error) {
      toast.error("Failed to add node");
      console.error("Error adding node:", error);
    }
  };

  const updateNode = (nodeId: string, configuration: any, name: string) => {
    try {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, configuration, name } : node
        )
      );
      setSelectedNode(null);
      toast.success("Node configuration updated");
    } catch (error) {
      toast.error("Failed to update node configuration");
      console.error("Error updating node:", error);
    }
  };

  const removeNode = (nodeId: string) => {
    try {
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return;

      //remove node
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));

      //rmove connections involving this node and update indices
      setConnections((prev) => {
        return prev
          .filter(
            (conn) => conn.fromIndex !== nodeIndex && conn.toIndex !== nodeIndex
          )
          .map((conn) => ({
            ...conn,
            fromIndex:
              conn.fromIndex > nodeIndex ? conn.fromIndex - 1 : conn.fromIndex,
            toIndex: conn.toIndex > nodeIndex ? conn.toIndex - 1 : conn.toIndex,
          }));
      });

      toast.success("Node removed");
    } catch (error) {
      toast.error("Failed to remove node");
      console.error("Error removing node:", error);
    }
  };

  const toggleConnectionType = (
    fromIndex: number,
    toIndex: number,
    type: ConnectionType
  ) => {
    try {
      const existingConnections = getConnectionsBetweenNodes(
        fromIndex,
        toIndex,
        connections
      );
      const hasType = existingConnections.some((conn) => conn.type === type);

      if (hasType) {
        setConnections((prev) =>
          removeConnectionType(fromIndex, toIndex, type, prev)
        );
      } else {
        setConnections((prev) =>
          addConnectionType(fromIndex, toIndex, type, prev)
        );
      }
    } catch (error) {
      toast.error("Failed to update connection");
      console.error("Error updating connection:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(nodes, connections);
      toast.success("Flow chart saved successfully");
    } catch (error) {
      toast.error("Failed to save flow chart");
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNodes(initialNodes);
    setConnections(initialConnections);
    setSelectedNode(null);

    onCancel();
    toast.info("Changes discarded");
  };

  return (
    <div className="w-full">
      {/* Fixed Controls */}
      <div className="mb-6 flex justify-end items-center bg-white border rounded-lg p-3 sticky top-0 z-10 shadow-sm">
        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Accept"}</span>
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
        </div>
      </div>

      {/* Available Nodes - Compact Top Bar */}
      <div className="mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Plus className="w-4 h-4" />
              <span>Available Nodes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {NODE_TYPES.map((nodeType) => (
                <Button
                  key={nodeType.type}
                  onClick={() => addNode(nodeType)}
                  variant="outline"
                  size="sm"
                  className="text-left hover:bg-blue-50"
                  disabled={saving}
                  title={nodeType.description}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {nodeType.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Selection */}
      {isAuthenticated && patients.length > 0 && (
        <div className="mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <span>Patient Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Select Patient:</label>
                <Combobox
                  items={patients.map(
                    (patient): ComboboxItem => ({
                      value: patient.id,
                      label: getPatientDisplayName(patient),
                    })
                  )}
                  value={selectedPatient?.id || ""}
                  onValueChange={(value) => {
                    const patient = patients.find((p) => p.id === value);
                    setSelectedPatient(patient || null);
                  }}
                  placeholder="No patient selected"
                  className="w-[300px]"
                />
                {selectedPatient && (
                  <span className="text-xs text-gray-500">
                    ID: {selectedPatient.id}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Selected patient will be included in "Transform Message" node in
                "subject" field.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flow Chart Area */}
      <div className="w-full">
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <div className="flex items-center space-x-6 min-w-max pb-4">
                {/* Input Node (UI only) */}
                <div className="flex flex-col items-center">
                  <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4 min-w-[120px] text-center">
                    <Play className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <div className="font-medium text-gray-700">Input</div>
                    <div className="text-xs text-gray-500">Start</div>
                  </div>
                </div>

                {/* Flow Nodes */}
                {nodes.map((node, index) => {
                  //find all connections coming into this node from any other node
                  const incomingConnections = connections.filter(
                    (conn) => conn.toIndex === index
                  );

                  //first connection (from Input) should not have connection types
                  const isFirstConnection = index === 0;

                  return (
                    <div key={node.id} className="flex items-center space-x-4">
                      {/* Connection Arrow with Multiple Types */}
                      <div className="flex flex-col items-center space-y-2">
                        <ArrowRight className="w-6 h-6 text-gray-400" />

                        {/* Connection Types - Only show for connections between actual nodes */}
                        {!isFirstConnection && (
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {CONNECTION_TYPES.map((type) => {
                              //check if any incoming connection has this type
                              const isActive = incomingConnections.some(
                                (conn) => conn.type === type
                              );
                              return (
                                <button
                                  key={type}
                                  onClick={() => {
                                    //for simplicity, toggle connection from previous node
                                    const fromIndex = index - 1;
                                    toggleConnectionType(
                                      fromIndex,
                                      index,
                                      type
                                    );
                                  }}
                                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                                    isActive
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                                  }`}
                                  disabled={saving}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Node */}
                      <div className="flex flex-col items-center">
                        <div
                          className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 min-w-[150px] text-center cursor-pointer hover:bg-blue-200 transition-colors relative"
                          onClick={() => setSelectedNode(node)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNode(node.id);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            disabled={saving}
                          >
                            <X className="w-3 h-3" />
                          </button>

                          <div className="font-medium text-blue-800">
                            {node.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {node.type.split(".").pop()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {nodes.length === 0 && (
                  <div className="flex items-center justify-center min-h-[200px] text-gray-500">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">
                        No nodes added yet
                      </div>
                      <div className="text-sm">
                        Select a node type from the top panel to get started
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Editor Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <NodeConfigurationEditor
            node={selectedNode}
            onSave={updateNode}
            onCancel={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
};
