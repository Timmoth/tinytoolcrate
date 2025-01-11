import React, { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import { compile } from 'mathjs'
import TextField from '../fields/TextField'

const PlotGraph: React.FC = () => {
  const [expression, setExpression] = useState<string>('x^2') // Default expression
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plotData, setPlotData] = useState<any>([]) // Data for the plot
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [minX, setMinX] = useState<string>('-10')
  const [maxX, setMaxX] = useState<string>('10')

  useEffect(() => {
    // Initial plot rendering on mount
    drawPlot()
  }, [expression, minX, maxX])

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
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Plot the graph */}
      <Plot
        data={plotData}
        layout={{
          title: 'Plot of f(x)',
          xaxis: { title: 'x' },
          yaxis: { title: 'f(x)' },
        }}
        useResizeHandler={true}
        config={{
          displaylogo: false,
        }}
      />
    </div>
  )
}

export default PlotGraph
