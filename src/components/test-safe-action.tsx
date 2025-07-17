'use client'

import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import {
  testPublicAction,
  testErrorAction,
} from '@/lib/actions/test-safe-action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TestSafeAction() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<string>('')

  const { execute: executePublicAction, isExecuting: isPublicExecuting } =
    useAction(testPublicAction, {
      onSuccess: ({ data }) => {
        setResult(`Success: ${JSON.stringify(data, null, 2)}`)
      },
      onError: ({ error }) => {
        setResult(`Error: ${error.serverError || 'Unknown error'}`)
      },
    })

  const { execute: executeErrorAction, isExecuting: isErrorExecuting } =
    useAction(testErrorAction, {
      onSuccess: ({ data }) => {
        setResult(`Success: ${JSON.stringify(data, null, 2)}`)
      },
      onError: ({ error }) => {
        setResult(`Error: ${error.serverError || 'Unknown error'}`)
      },
    })

  const handleTestPublic = () => {
    executePublicAction({
      message: message || 'Test message',
      priority: 'medium',
    })
  }

  const handleTestError = () => {
    executeErrorAction({
      shouldError: true,
      errorType: 'server',
    })
  }

  const handleTestSuccess = () => {
    executeErrorAction({
      shouldError: false,
      errorType: 'server',
    })
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Safe Action Configuration</h2>

      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter test message"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTestPublic} disabled={isPublicExecuting}>
            {isPublicExecuting ? 'Testing...' : 'Test Public Action'}
          </Button>

          <Button
            onClick={handleTestError}
            disabled={isErrorExecuting}
            variant="destructive"
          >
            {isErrorExecuting ? 'Testing...' : 'Test Error'}
          </Button>

          <Button
            onClick={handleTestSuccess}
            disabled={isErrorExecuting}
            variant="outline"
          >
            {isErrorExecuting ? 'Testing...' : 'Test Success'}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
