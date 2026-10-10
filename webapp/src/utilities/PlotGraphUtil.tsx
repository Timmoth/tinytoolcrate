import React, { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { compile } from 'mathjs'
import TextField from '../fields/TextField'
import { useTheme } from '../theme'

const PlotGraph: React.FC = () => {
  const theme = useTheme()
  const [expression, setExpression] = useState<string>('x^2') // Default expression
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plotData, setPlotData] = useState<any>([]) // Data for the plot
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [minX, setMinX] = useState<string>('-10')
  const [maxX, setMaxX] = useState<string>('10')

  useEffect(() => {
    // Initial plot rendering on mount
    drawPlot()
  }, [expression, minX, maxX, theme])

  // Function to draw the plot based on the expression
  const drawPlot = () => {
    try {
      const expr = compile(expression)
      const length = 1000
      const mX = Number(minX)
      const increment = (Number(maxX) - mX) / length
      const xValues = Array.from(
        { length: length },
        (_, i) => mX + i * increment
      )
      const yValues = xValues.map((x) => expr.evaluate({ x }))

      // Update the plot data
      setPlotData([
        {
          x: xValues,
          y: yValues,
          type: 'scatter',
          mode: 'lines',
          name: 'f(x)',
          line: {
            color: theme === 'dark' ? '#6366f1' : '#4f46e5',
            width: 2,
          },
        },
      ])

      // Clear any previous error messages
      setErrorMessage('')
    } catch (err) {
      console.error(err)
      setErrorMessage('Error in expression')
    }
  }

  return (
    <div className="m-4 flex flex-col space-y-4">
      <TextField
        label="y="
        content={expression}
        onContentChange={(e) => setExpression(e)}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />
      <div className="flex space-x-4">
        <TextField
          label="min-x"
          content={minX.toString()}
          onContentChange={(e) => setMinX(e)}
          isReadonly={false}
          isCopyable={true}
          isMultiline={false}
        />
        <TextField
          label="max-x"
          content={maxX.toString()}
          onContentChange={(e) => setMaxX(e)}
          isReadonly={false}
          isCopyable={true}
          isMultiline={false}
        />
      </div>
      {/* Display error message */}
      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      {/* Plot the graph */}
      <div data-testid="plot">
        <Plot
          data={plotData}
        layout={{
          title: {
            text: 'Plot of f(x)',
            font: { size: 14, color: theme === 'dark' ? '#e4e4e7' : '#18181b' },
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: theme === 'dark' ? '#a1a1aa' : '#71717a' },
          margin: { t: 40, r: 20, b: 50, l: 50 },
          xaxis: {
            title: { text: 'x', font: { size: 12 } },
            gridcolor: theme === 'dark' ? '#27272a' : '#e4e4e7',
            zerolinecolor: theme === 'dark' ? '#3f3f46' : '#d4d4d8',
          },
          yaxis: {
            title: { text: 'f(x)', font: { size: 12 } },
            gridcolor: theme === 'dark' ? '#27272a' : '#e4e4e7',
            zerolinecolor: theme === 'dark' ? '#3f3f46' : '#d4d4d8',
          },
        }}
          useResizeHandler={true}
          config={{
            displaylogo: false,
          }}
        />
      </div>
    </div>
  )
}

export default PlotGraph
