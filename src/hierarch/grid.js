import React from "react"
import styled from "styled-components"
import { useTable } from "react-table"

const Grid = ({ schema, model }) => {
    const columns = [
        { Header: "name", accessor: "name" },
        { Header: "address", accessor: "address" },
    ]
    console.log(model.toJSON())
    const tableInstance = useTable({ columns, data: model.toJSON().companies })

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
                <tbody>
                <tr>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </Display>
    )
}

const Display = styled.div`

`

export default Grid