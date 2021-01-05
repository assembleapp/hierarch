import React from "react"
import styled from "styled-components"
import { useTable } from "react-table"

const Grid = ({ schema, model, upgradeRecord }) => {
    const columns = React.useMemo(
        () => [
            { Header: "name", accessor: "name" },
            { Header: "address", accessor: "address" },
            { Header: "danger", accessor: "danger" },
        ],
        []
    )

    const data = model.toJSON().companies
    const tableInstance = useTable({
        columns,
        data,
        defaultColumn,
        // upgradeRecord isn't part of the API, but
        // anything we put into these options will
        // automatically be available on the instance.
        // That way we can call this function from our
        // cell renderer!
        upgradeRecord,
    })

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance

    return (
        <Display>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(header => (
                        <tr {...header.getHeaderGroupProps()}>
                            {header.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>
                                        {cell.render('Cell')}
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </Display>
    )
}

const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    upgradeRecord, // This is a custom function that we supplied to our table instance
  }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
      setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      upgradeRecord(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return <input value={value} onChange={onChange} onBlur={onBlur} />
}

// Set our editable cell renderer as the default Cell renderer
const defaultColumn = {
Cell: EditableCell,
}

const Display = styled.div`

`

export default Grid