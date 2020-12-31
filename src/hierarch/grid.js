import React from "react"
import styled from "styled-components"
import { useTable } from "react-table"

const Grid = ({ schema, model }) => {
    const columns = React.useMemo(
        () => [
            { Header: "name", accessor: "name" },
            { Header: "address", accessor: "address" },
        ],
        []
    )

    const data = model.toJSON().companies
    const tableInstance = useTable({ columns, data })

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

const Display = styled.div`

`

export default Grid