'use client';

import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Paper,
  Typography,
  Box,
} from '@mui/material';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  userId: string;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  loading: boolean;
}

export function TaskList({ tasks, onToggle, loading }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No tasks found. Create your first task to get started.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} disablePadding>
            <ListItemButton
              onClick={() => onToggle(task.id)}
              disabled={loading}
              dense
            >
              <Checkbox
                edge="start"
                checked={task.done}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText
                primary={task.title}
                secondary={new Date(task.createdAt).toLocaleString()}
                sx={{
                  textDecoration: task.done ? 'line-through' : 'none',
                  color: task.done ? 'text.secondary' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
