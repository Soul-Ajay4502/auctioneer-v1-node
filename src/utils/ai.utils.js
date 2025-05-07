/**
 * Detect if the query is requesting a visualization and what type
 * @param {string} query - The search query
 * @returns {string|null} - Visualization type or null if not a visualization request
 */
function detectVisualizationRequest(query) {
    const queryLower = query.toLowerCase()

    // Check for pie chart requests
    if (
        queryLower.includes('pie chart') ||
        queryLower.includes('distribution') ||
        (queryLower.includes('breakdown') && (queryLower.includes('by type') || queryLower.includes('by status')))
    ) {
        return 'pie'
    }

    // Check for bar chart requests
    if (
        queryLower.includes('bar chart') ||
        queryLower.includes('bar graph') ||
        queryLower.includes('histogram') ||
        queryLower.includes('count of')
    ) {
        return 'bar'
    }

    // Check for timeline/gantt chart requests
    if (
        queryLower.includes('timeline') ||
        queryLower.includes('gantt') ||
        queryLower.includes('schedule') ||
        (queryLower.includes('task') && queryLower.includes('due date'))
    ) {
        return 'timeline'
    }

    return null
}

/**
 * Generate visualization code based on results and visualization type
 * @param {Array} results - The search results
 * @param {string} visualizationType - Type of visualization to generate
 * @returns {Object|null} - Visualization data or null if can't be generated
 */
function generateVisualizationCode(results, visualizationType) {
    if (!results || results.length === 0) {
        return null
    }

    switch (visualizationType) {
        case 'pie': {
            // Group by type or status
            const entities = {}
            let groupBy = 'type'

            // Determine if we should group by status instead of type
            const hasStatus = results.some((result) => result.payload.status)
            if (hasStatus) {
                groupBy = 'status'
            }

            // Count entities by the determined grouping
            results.forEach((result) => {
                const key = groupBy === 'status' ? result.payload.status || 'Unknown' : result.payload.type

                entities[key] = (entities[key] || 0) + 1
            })

            // Prepare data for chart
            const labels = Object.keys(entities)
            const values = Object.values(entities)

            // Generate colors
            const colors = labels.map((label, index) => {
                const defaultColors = [
                    '#4299E1', // blue
                    '#48BB78', // green
                    '#F6AD55', // orange
                    '#FC8181', // red
                    '#9F7AEA', // purple
                    '#667EEA', // indigo
                    '#ED64A6', // pink
                    '#F6E05E', // yellow
                    '#CBD5E0', // gray
                    '#4FD1C5', // teal
                ]

                return defaultColors[index % defaultColors.length]
            })

            return {
                type: 'pie',
                title: `Distribution by ${groupBy === 'status' ? 'Status' : 'Type'}`,
                data: {
                    labels,
                    values,
                    colors,
                },
            }
        }

        case 'bar': {
            // Count by type
            const counts = {
                workspace: 0,
                project: 0,
                feature: 0,
                task: 0,
            }

            results.forEach((result) => {
                const type = result.payload.type
                if (counts[type] !== undefined) {
                    counts[type]++
                }
            })

            const labels = Object.keys(counts)
            const values = Object.values(counts)

            // Generate colors
            const colors = [
                '#9F7AEA', // purple for workspace
                '#4299E1', // blue for project
                '#F6AD55', // orange for feature
                '#FC8181', // red for task
            ]

            return {
                type: 'bar',
                title: 'Count by Entity Type',
                data: {
                    labels,
                    values,
                    colors,
                },
            }
        }

        case 'timeline': {
            // Only use tasks with start and due dates
            const tasksWithDates = results
                .filter((result) => result.payload.type === 'task' && result.payload.start_date && result.payload.due_date)
                .map((result) => ({
                    id: result.payload.short_code,
                    shortCode: result.payload.short_code,
                    name: result.payload.title,
                    start: result.payload.start_date,
                    end: result.payload.due_date,
                    status: result.payload.status,
                    assignee: result.payload.assignee || 'Unassigned',
                }))

            if (tasksWithDates.length < 2) {
                return null // Not enough data for a meaningful timeline
            }

            return {
                type: 'timeline',
                title: 'Task Timeline',
                data: tasksWithDates,
            }
        }

        default:
            return null
    }
}

export { detectVisualizationRequest, generateVisualizationCode }
