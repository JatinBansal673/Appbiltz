import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#111827'
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4
  },
  text: {
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 1.4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  item: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb'
  },
  small: {
    fontSize: 10,
    color: '#4b5563'
  }
});

export const DashboardDocument = ({userData={}, commits=[],totalStars=0, totalCommits=0}) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>Github Profile</Text>
      <Text style={styles.text}>Name: {userData.name}</Text>
      <Text style={styles.text}>Followers: {userData.followers}</Text>
      <Text style={styles.text}>Public Repos:{userData.public_repos}</Text>
      <Text style={styles.text}>Stars: {totalStars}</Text>
      <Text style={styles.text}>Commits: {totalCommits}</Text>
      <Text style={styles.heading}>Repositories and Commits</Text>
      {commits.map((commit,idx) => (
          <View style={styles.item} key={`Repo-${idx}`}>
            <Text style={styles.label}>{commit.repo}</Text>
            <Text style={styles.small}>Commits: {commit.commits}</Text>
          </View>
      ))}
    </Page>
  </Document>
);

export const ProjectsDocument = ({ projects = [], searchTerm = '' }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>Project Manager</Text>
      {searchTerm ? <Text style={styles.small}>Filtered by: {searchTerm}</Text> : null}
      <Text style={[styles.text, styles.section]}>Total projects: {projects.length}</Text>
      {projects.length === 0 ? (
        <Text style={styles.text}>No projects available for export.</Text>
      ) : (
        projects.map((project, index) => (
          <View style={styles.item} key={`project-${index}`}>
            <Text style={styles.label}>{project.name}</Text>
            {project.description ? <Text style={styles.text}>{project.description}</Text> : null}
            {project.techStack ? <Text style={styles.text}>Tech stack: {project.techStack}</Text> : null}
            <Text style={styles.small}>Status: {project.status}</Text>
          </View>
        ))
      )}
    </Page>
  </Document>
);

export const TaskBoardDocument = ({ tasks = {} }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>Task Board</Text>
      <Text style={[styles.text, styles.section]}>A quick export of task board columns and items.</Text>
      {Object.entries(tasks).map(([column, items]) => (
        <View key={column} style={styles.section}>
          <Text style={styles.label}>{column.toUpperCase()} ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={styles.text}>No tasks in this column.</Text>
          ) : (
            items.map((task, index) => (
              <View key={`${column}-${task.id || index}`} style={styles.item}>
                <Text style={styles.text}>{task.title}</Text>
                {task.description ? <Text style={styles.small}>{task.description}</Text> : null}
                {task.assignee ? <Text style={styles.small}>Assignee: {task.assignee}</Text> : null}
              </View>
            ))
          )}
        </View>
      ))}
    </Page>
  </Document>
);

export const ActivityChartDocument = ({ viewMode = 'weekly', rangeLabel = '', stats = {}, entries = [] }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>Activity Summary</Text>
      <Text style={styles.text}>Mode: {viewMode}</Text>
      <Text style={styles.text}>Range: {rangeLabel}</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Summary</Text>
        <Text style={styles.text}>Total Hours: {stats.totalHours ?? 0}</Text>
        <Text style={styles.text}>Total Tasks: {stats.totalTasks ?? 0}</Text>
        <Text style={styles.text}>Total Projects: {stats.totalProjects ?? 0}</Text>
        <Text style={styles.text}>Average Hours: {stats.avgHours ?? 0}</Text>
        <Text style={styles.text}>Utilization: {stats.utilization ?? 0}%</Text>
      </View>
      {entries.length === 0 ? (
        <Text style={styles.text}>No activity entries available.</Text>
      ) : (
        entries.slice(0, 10).map((entry, index) => (
          <View style={styles.item} key={`entry-${index}`}>
            <Text style={styles.label}>{entry.date} - {entry.category}</Text>
            <Text style={styles.text}>Hours: {entry.hours}, Tasks: {entry.tasks}, Projects: {entry.projects}</Text>
            {entry.notes ? <Text style={styles.small}>{entry.notes}</Text> : null}
          </View>
        ))
      )}
    </Page>
  </Document>
);
