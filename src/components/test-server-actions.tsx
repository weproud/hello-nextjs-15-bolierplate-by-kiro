'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  getUserProjectsAction,
} from '@/lib/actions/project-actions'
import {
  createPhaseAction,
  updatePhaseAction,
  deletePhaseAction,
  getProjectPhasesAction,
} from '@/lib/actions/phase-actions'
import {
  bulkDeleteProjectsAction,
  duplicateProjectAction,
  getProjectStatsAction,
  rateLimitedAction,
  complexValidationAction,
  errorTestAction,
} from '@/lib/actions/sample-actions'

/**
 * Test component demonstrating comprehensive server action usage
 * This component shows how to use all the implemented server actions
 * with proper error handling and loading states
 */
export function TestServerActions() {
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [results, setResults] = useState<any[]>([])

  // Project actions
  const createProject = useAction(createProjectAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Create Project', success: true, data },
      ])
      setProjectTitle('')
      setProjectDescription('')
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        { action: 'Create Project', success: false, error: error.serverError },
      ])
    },
  })

  const getUserProjects = useAction(getUserProjectsAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Get User Projects', success: true, data },
      ])
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        {
          action: 'Get User Projects',
          success: false,
          error: error.serverError,
        },
      ])
    },
  })

  const deleteProject = useAction(deleteProjectAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Delete Project', success: true, data },
      ])
      setSelectedProjectId('')
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        { action: 'Delete Project', success: false, error: error.serverError },
      ])
    },
  })

  // Sample actions for testing
  const duplicateProject = useAction(duplicateProjectAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Duplicate Project', success: true, data },
      ])
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        {
          action: 'Duplicate Project',
          success: false,
          error: error.serverError,
        },
      ])
    },
  })

  const getProjectStats = useAction(getProjectStatsAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Get Project Stats', success: true, data },
      ])
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        {
          action: 'Get Project Stats',
          success: false,
          error: error.serverError,
        },
      ])
    },
  })

  const rateLimitedTest = useAction(rateLimitedAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Rate Limited Action', success: true, data },
      ])
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        {
          action: 'Rate Limited Action',
          success: false,
          error: error.serverError,
        },
      ])
    },
  })

  const complexValidationTest = useAction(complexValidationAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Complex Validation', success: true, data },
      ])
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        {
          action: 'Complex Validation',
          success: false,
          error: error.serverError,
        },
      ])
    },
  })

  const errorTest = useAction(errorTestAction, {
    onSuccess: ({ data }) => {
      setResults(prev => [
        ...prev,
        { action: 'Error Test', success: true, data },
      ])
    },
    onError: ({ error }) => {
      setResults(prev => [
        ...prev,
        { action: 'Error Test', success: false, error: error.serverError },
      ])
    },
  })

  const clearResults = () => setResults([])

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Server Actions Test Suite</h2>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      {/* Project CRUD Operations */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Project Operations</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Project title"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
            />
            <Input
              placeholder="Project description (optional)"
              value={projectDescription}
              onChange={e => setProjectDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() =>
                createProject.execute({
                  title: projectTitle,
                  description: projectDescription,
                })
              }
              disabled={createProject.isExecuting || !projectTitle}
            >
              {createProject.isExecuting ? 'Creating...' : 'Create Project'}
            </Button>
            <Button
              onClick={() => getUserProjects.execute({ limit: 10, offset: 0 })}
              disabled={getUserProjects.isExecuting}
              variant="outline"
            >
              {getUserProjects.isExecuting ? 'Loading...' : 'Get My Projects'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Operations */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Advanced Operations</h3>
        <div className="space-y-4">
          <Input
            placeholder="Project ID for operations"
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() =>
                duplicateProject.execute({
                  projectId: selectedProjectId,
                  newTitle: `Copy of ${projectTitle || 'Project'}`,
                })
              }
              disabled={duplicateProject.isExecuting || !selectedProjectId}
              variant="outline"
            >
              {duplicateProject.isExecuting
                ? 'Duplicating...'
                : 'Duplicate Project'}
            </Button>
            <Button
              onClick={() =>
                getProjectStats.execute({ projectId: selectedProjectId })
              }
              disabled={getProjectStats.isExecuting || !selectedProjectId}
              variant="outline"
            >
              {getProjectStats.isExecuting ? 'Loading...' : 'Get Project Stats'}
            </Button>
            <Button
              onClick={() => deleteProject.execute({ id: selectedProjectId })}
              disabled={deleteProject.isExecuting || !selectedProjectId}
              variant="destructive"
            >
              {deleteProject.isExecuting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Handling Tests */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Error Handling & Validation Tests
        </h3>
        <div className="space-y-4">
          <Input
            placeholder="Test message"
            value={testMessage}
            onChange={e => setTestMessage(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() =>
                rateLimitedTest.execute({
                  message: testMessage || 'Test message',
                })
              }
              disabled={rateLimitedTest.isExecuting}
              variant="outline"
            >
              {rateLimitedTest.isExecuting
                ? 'Testing...'
                : 'Test Rate Limiting'}
            </Button>
            <Button
              onClick={() =>
                complexValidationTest.execute({
                  email: 'test@example.com',
                  age: 25,
                  preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'en',
                  },
                  tags: ['test', 'demo'],
                })
              }
              disabled={complexValidationTest.isExecuting}
              variant="outline"
            >
              {complexValidationTest.isExecuting
                ? 'Validating...'
                : 'Test Complex Validation'}
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(
              [
                'validation',
                'not_found',
                'authorization',
                'database',
                'generic',
                'success',
              ] as const
            ).map(errorType => (
              <Button
                key={errorType}
                onClick={() =>
                  errorTest.execute({
                    errorType,
                    message: `Test ${errorType} error`,
                  })
                }
                disabled={errorTest.isExecuting}
                variant={errorType === 'success' ? 'default' : 'destructive'}
                size="sm"
              >
                {errorTest.isExecuting ? 'Testing...' : `Test ${errorType}`}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Display */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Results ({results.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-muted-foreground">
              No results yet. Try executing some actions above.
            </p>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">{result.action}</span>
                  <span
                    className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {result.success ? 'Success' : 'Error'}
                  </span>
                </div>
                <pre className="text-xs mt-2 overflow-x-auto">
                  {JSON.stringify(
                    result.success ? result.data : result.error,
                    null,
                    2
                  )}
                </pre>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
