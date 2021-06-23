import { SetStateAction, useCallback, useState } from 'react';
import { useTable, Row } from 'react-table';

import styles from './styles.module.css';

interface ITable {
  columns: {
    Header: string;
    accessor: string;
  }[];
  data: Array<object>;
  set_selected_level_course: (arg: SetStateAction<number>) => void;
}

const Table = ({ columns, data, set_selected_level_course,...rest }: ITable) => {
  const [selectedTR, setSelectedTR] = useState<string>("");
  const {
    getTableProps,
    getTableBodyProps,
    prepareRow,
    headers,
    rows,
  } = useTable(
    {
      columns,
      data,
    }
  );

  const handleTableLineClick = useCallback((row: Row) => {
    set_selected_level_course(row.cells[2].value);
    setSelectedTR(row.id);
  }, [set_selected_level_course]);

  return (
    <table {...rest} className={styles.container}>
      <thead {...getTableProps}>
        <tr>
          {headers.map(column => (
            <th key={column.id} {...column.getHeaderProps()}>{column.render('Header')}</th>
          ))}
        </tr>
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr 
              key={row.id} 
              {...row.getRowProps()} 
              onClick={() => handleTableLineClick(row)}
              className={`${selectedTR === row.id && styles.checked}`}
            >
              {row.cells.map(cell => (
                <td key={cell.value} {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;