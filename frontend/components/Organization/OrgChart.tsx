'use client';

import { useMemo } from 'react';
import { API_BASE_URL } from '@/services/api';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import { Box, Paper, Avatar, Typography, Chip } from '@mui/material';

interface Employee {
    _id: string;
    fullName: string;
    employeeNumber: string;
    primaryPositionId?: {
        title: string;
        _id: string;
    };
    primaryDepartmentId?: {
        name: string;
        _id: string;
    };
    profilePictureUrl?: string;
    status?: string;
}

interface OrgChartProps {
    employees: Employee[];
}

// Custom node component
const CustomNode = ({ data }: any) => {
    const profilePictureUrl = data.profilePictureUrl
        ? `${API_BASE_URL}${data.profilePictureUrl}`
        : undefined;

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                minWidth: 200,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: 6,
                },
            }}
        >
            <Avatar
                src={profilePictureUrl}
                sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }}
            >
                {data.label?.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="bold">
                {data.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
                {data.position || 'No Position'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                {data.department || 'No Department'}
            </Typography>
            <Chip
                label={data.status || 'ACTIVE'}
                size="small"
                color={data.status === 'ACTIVE' ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
            />
        </Paper>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

export default function OrgChart({ employees }: OrgChartProps) {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Define role hierarchy (higher number = higher in org chart)
        const roleHierarchy: Record<string, number> = {
            'System Admin': 5,
            'HR Manager': 4,
            'HR Admin': 4,
            'Department Head': 3,
            'HR Employee': 2,
            'Payroll Manager': 2,
            'Recruiter': 2,
            'Payroll Specialist': 1,
            'Employee': 0,
        };

        // Get role level for an employee
        const getRoleLevel = (emp: Employee): number => {
            // Check if employee has systemRole field
            const systemRole = (emp as any).systemRole;
            if (systemRole && roleHierarchy[systemRole] !== undefined) {
                return roleHierarchy[systemRole];
            }
            return 0; // Default to lowest level
        };

        // Group employees by role level
        const levelGroups: Record<number, Employee[]> = {};

        employees.forEach((emp) => {
            const level = getRoleLevel(emp);
            if (!levelGroups[level]) {
                levelGroups[level] = [];
            }
            levelGroups[level].push(emp);
        });

        // Layout configuration
        const nodeWidth = 240;
        const nodeHeight = 200;
        const horizontalGap = 60;
        const verticalGap = 120;

        let currentY = 0;

        // Sort levels from highest to lowest
        const sortedLevels = Object.keys(levelGroups)
            .map(Number)
            .sort((a, b) => b - a);

        sortedLevels.forEach((level) => {
            const levelEmployees = levelGroups[level];
            const employeesInRow = Math.min(5, levelEmployees.length); // Max 5 per row
            const totalRows = Math.ceil(levelEmployees.length / employeesInRow);

            levelEmployees.forEach((emp, empIndex) => {
                const row = Math.floor(empIndex / employeesInRow);
                const col = empIndex % employeesInRow;

                // Center the row
                const rowEmployeeCount = (row === totalRows - 1)
                    ? levelEmployees.length - (row * employeesInRow)
                    : employeesInRow;
                const totalWidth = rowEmployeeCount * nodeWidth + (rowEmployeeCount - 1) * horizontalGap;
                const rowOffset = -totalWidth / 2 + (window.innerWidth || 1200) / 2;

                const systemRole = (emp as any).systemRole || 'Employee';
                const position = emp.primaryPositionId?.title || systemRole;

                nodes.push({
                    id: emp._id,
                    type: 'custom',
                    position: {
                        x: rowOffset + col * (nodeWidth + horizontalGap),
                        y: currentY + row * (nodeHeight + verticalGap)
                    },
                    data: {
                        label: emp.fullName,
                        position: position,
                        department: systemRole, // Show system role instead of department
                        profilePictureUrl: emp.profilePictureUrl,
                        status: emp.status,
                    },
                });

                // Create horizontal edges between employees in same row
                if (col > 0 && row === Math.floor((empIndex - 1) / employeesInRow)) {
                    edges.push({
                        id: `e${levelEmployees[empIndex - 1]._id}-${emp._id}`,
                        source: levelEmployees[empIndex - 1]._id,
                        target: emp._id,
                        type: 'smoothstep',
                        animated: false,
                        style: { stroke: '#cbd5e1', strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                        },
                    });
                }
            });

            currentY += totalRows * (nodeHeight + verticalGap) + 60;
        });

        // Create vertical edges between levels (from higher to lower roles)
        for (let i = 0; i < sortedLevels.length - 1; i++) {
            const currentLevel = sortedLevels[i];
            const nextLevel = sortedLevels[i + 1];

            const currentLevelEmps = levelGroups[currentLevel];
            const nextLevelEmps = levelGroups[nextLevel];

            // Connect first employee of current level to first of next level
            if (currentLevelEmps.length > 0 && nextLevelEmps.length > 0) {
                edges.push({
                    id: `level-${currentLevel}-${nextLevel}`,
                    source: currentLevelEmps[0]._id,
                    target: nextLevelEmps[0]._id,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#3b82f6', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    },
                });
            }
        }

        return { nodes, edges };
    }, [employees]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <>
            <style jsx global>{`
                /* ReactFlow Base Styles */
                .react-flow {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    position: relative;
                    z-index: 0;
                    background-color: #fafafa;
                }
                .react-flow__container {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                }
                .react-flow__pane {
                    z-index: 1;
                    cursor: grab;
                    cursor: -webkit-grab;
                }
                .react-flow__pane.dragging {
                    cursor: grabbing;
                    cursor: -webkit-grabbing;
                }
                .react-flow__viewport {
                    transform-origin: 0 0;
                    z-index: 2;
                    pointer-events: none;
                }
                .react-flow__renderer {
                    z-index: 4;
                }
                .react-flow__selection {
                    z-index: 6;
                }
                .react-flow__nodesselection-rect:focus,
                .react-flow__nodesselection-rect:focus-visible {
                    outline: none;
                }
                .react-flow .react-flow__edges {
                    pointer-events: none;
                    overflow: visible;
                }
                .react-flow__edge-path,
                .react-flow__connection-path {
                    stroke: #b1b1b7;
                    stroke-width: 1;
                    fill: none;
                }
                .react-flow__edge {
                    pointer-events: visibleStroke;
                    cursor: pointer;
                }
                .react-flow__edge.animated path {
                    stroke-dasharray: 5;
                    animation: dashdraw 0.5s linear infinite;
                }
                .react-flow__edge.animated path.react-flow__edge-interaction {
                    stroke-dasharray: none;
                    animation: none;
                }
                .react-flow__edge.inactive {
                    pointer-events: none;
                }
                .react-flow__edge.selected,
                .react-flow__edge:focus,
                .react-flow__edge:focus-visible {
                    outline: none;
                }
                .react-flow__edge.selected .react-flow__edge-path,
                .react-flow__edge:focus .react-flow__edge-path,
                .react-flow__edge:focus-visible .react-flow__edge-path {
                    stroke: #555;
                }
                .react-flow__edge-textwrapper {
                    pointer-events: all;
                }
                .react-flow__edge-textbg {
                    fill: white;
                }
                .react-flow__edge .react-flow__edge-text {
                    pointer-events: none;
                    user-select: none;
                }
                .react-flow__node {
                    position: absolute;
                    user-select: none;
                    pointer-events: all;
                    transform-origin: 0 0;
                    box-sizing: border-box;
                    cursor: grab;
                    cursor: -webkit-grab;
                }
                .react-flow__node.dragging {
                    cursor: grabbing;
                    cursor: -webkit-grabbing;
                }
                .react-flow__nodesselection {
                    z-index: 3;
                    transform-origin: left top;
                    pointer-events: none;
                }
                .react-flow__nodesselection-rect {
                    position: absolute;
                    pointer-events: all;
                    cursor: grab;
                    cursor: -webkit-grab;
                }
                .react-flow__handle {
                    position: absolute;
                    pointer-events: none;
                    min-width: 5px;
                    min-height: 5px;
                }
                .react-flow__handle.connectable {
                    pointer-events: all;
                    cursor: crosshair;
                }
                .react-flow__handle-bottom {
                    top: auto;
                    left: 50%;
                    bottom: -4px;
                    transform: translate(-50%, 0);
                }
                .react-flow__handle-top {
                    left: 50%;
                    top: -4px;
                    transform: translate(-50%, 0);
                }
                .react-flow__handle-left {
                    top: 50%;
                    left: -4px;
                    transform: translate(0, -50%);
                }
                .react-flow__handle-right {
                    right: -4px;
                    top: 50%;
                    transform: translate(0, -50%);
                }
                .react-flow__edgeupdater {
                    cursor: move;
                    pointer-events: all;
                }
                .react-flow__panel {
                    position: absolute;
                    z-index: 5;
                    margin: 15px;
                }
                .react-flow__panel.top {
                    top: 0;
                }
                .react-flow__panel.bottom {
                    bottom: 0;
                }
                .react-flow__panel.left {
                    left: 0;
                }
                .react-flow__panel.right {
                    right: 0;
                }
                .react-flow__panel.center {
                    left: 50%;
                    transform: translateX(-50%);
                }
                .react-flow__attribution {
                    font-size: 10px;
                    background: rgba(255, 255, 255, 0.5);
                    padding: 2px 3px;
                    margin: 0;
                }
                .react-flow__attribution a {
                    text-decoration: none;
                    color: #999;
                }
                @keyframes dashdraw {
                    from {
                        stroke-dashoffset: 10;
                    }
                }
                .react-flow__edgelabel-renderer {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    user-select: none;
                }
                .react-flow__edge.updating .react-flow__edge-path {
                    stroke: #777;
                }
                .react-flow__edge-text {
                    font-size: 10px;
                }
                .react-flow__node.selectable:focus,
                .react-flow__node.selectable:focus-visible {
                    outline: none;
                }
                .react-flow__node-default,
                .react-flow__node-input,
                .react-flow__node-output,
                .react-flow__node-group {
                    padding: 10px;
                    border-radius: 3px;
                    width: 150px;
                    font-size: 12px;
                    color: #222;
                    text-align: center;
                    border-width: 1px;
                    border-style: solid;
                    border-color: #1a192b;
                    background-color: white;
                }
                .react-flow__node-default.selectable:hover,
                .react-flow__node-input.selectable:hover,
                .react-flow__node-output.selectable:hover,
                .react-flow__node-group.selectable:hover {
                    box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.08);
                }
                .react-flow__node-default.selectable.selected,
                .react-flow__node-default.selectable:focus,
                .react-flow__node-default.selectable:focus-visible,
                .react-flow__node-input.selectable.selected,
                .react-flow__node-input.selectable:focus,
                .react-flow__node-input.selectable:focus-visible,
                .react-flow__node-output.selectable.selected,
                .react-flow__node-output.selectable:focus,
                .react-flow__node-output.selectable:focus-visible,
                .react-flow__node-group.selectable.selected,
                .react-flow__node-group.selectable:focus,
                .react-flow__node-group.selectable:focus-visible {
                    box-shadow: 0 0 0 0.5px #1a192b;
                }
                .react-flow__node-group {
                    background-color: rgba(240, 240, 240, 0.25);
                }
                .react-flow__nodesselection-rect,
                .react-flow__selection {
                    background: rgba(0, 89, 220, 0.08);
                    border: 1px dotted rgba(0, 89, 220, 0.8);
                }
                .react-flow__nodesselection-rect:focus,
                .react-flow__nodesselection-rect:focus-visible,
                .react-flow__selection:focus,
                .react-flow__selection:focus-visible {
                    outline: none;
                }
                .react-flow__controls {
                    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
                }
                .react-flow__controls-button {
                    border: none;
                    background: #fefefe;
                    border-bottom: 1px solid #eee;
                    box-sizing: content-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    user-select: none;
                    padding: 5px;
                }
                .react-flow__controls-button:hover {
                    background: #f4f4f4;
                }
                .react-flow__controls-button svg {
                    width: 100%;
                    max-width: 12px;
                    max-height: 12px;
                }
                .react-flow__controls-button:disabled {
                    pointer-events: none;
                }
                .react-flow__controls-button:disabled svg {
                    fill-opacity: 0.4;
                }
                .react-flow__minimap {
                    background-color: #fff;
                }
                .react-flow__resize-control {
                    position: absolute;
                }
                .react-flow__resize-control.left,
                .react-flow__resize-control.right {
                    cursor: ew-resize;
                }
                .react-flow__resize-control.top,
                .react-flow__resize-control.bottom {
                    cursor: ns-resize;
                }
                .react-flow__resize-control.top.left,
                .react-flow__resize-control.bottom.right {
                    cursor: nwse-resize;
                }
                .react-flow__resize-control.bottom.left,
                .react-flow__resize-control.top.right {
                    cursor: nesw-resize;
                }
                .react-flow__resize-control.handle {
                    width: 4px;
                    height: 4px;
                    border: 1px solid #fff;
                    border-radius: 1px;
                    background-color: #3367d9;
                    transform: translate(-50%, -50%);
                }
                .react-flow__resize-control.handle.left {
                    left: 0;
                    top: 50%;
                }
                .react-flow__resize-control.handle.right {
                    left: 100%;
                    top: 50%;
                }
                .react-flow__resize-control.handle.top {
                    left: 50%;
                    top: 0;
                }
                .react-flow__resize-control.handle.bottom {
                    left: 50%;
                    top: 100%;
                }
                .react-flow__resize-control.handle.top.left {
                    left: 0;
                    top: 0;
                }
                .react-flow__resize-control.handle.bottom.left {
                    left: 0;
                    top: 100%;
                }
                .react-flow__resize-control.handle.top.right {
                    left: 100%;
                    top: 0;
                }
                .react-flow__resize-control.handle.bottom.right {
                    left: 100%;
                    top: 100%;
                }
                .react-flow__resize-control.line {
                    border-color: #3367d9;
                    border-width: 0;
                    border-style: solid;
                }
                .react-flow__resize-control.line.left,
                .react-flow__resize-control.line.right {
                    width: 1px;
                    transform: translate(-50%, 0);
                    top: 0;
                    height: 100%;
                }
                .react-flow__resize-control.line.left {
                    left: 0;
                    border-left-width: 1px;
                }
                .react-flow__resize-control.line.right {
                    left: 100%;
                    border-right-width: 1px;
                }
                .react-flow__resize-control.line.top,
                .react-flow__resize-control.line.bottom {
                    height: 1px;
                    transform: translate(0, -50%);
                    left: 0;
                    width: 100%;
                }
                .react-flow__resize-control.line.top {
                    top: 0;
                    border-top-width: 1px;
                }
                .react-flow__resize-control.line.bottom {
                    border-bottom-width: 1px;
                    top: 100%;
                }
            `}</style>
            <Box sx={{ height: '700px', width: '100%', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Background />
                    <Controls />
                    <MiniMap
                        nodeStrokeWidth={3}
                        zoomable
                        pannable
                    />
                </ReactFlow>
            </Box>
        </>
    );
}
