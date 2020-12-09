import React ,{useEffect} from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Button from "@material-ui/core/Button";


import { removeTurno, getTurnosByDNI } from 'controller/turnoController';

function createData(razon, fecha, profesional, estado) {
  return { razon, fecha, profesional, estado };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'razon', numeric: false, disablePadding: true, label: 'Razon' },
  { id: 'fecha', numeric: true, disablePadding: false, label: 'Dia y Horario' },
  { id: 'profesional', numeric: true, disablePadding: false, label: 'Profesional' },
  { id: 'estado', numeric: true, disablePadding: false, label: 'Estado' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function EnhancedTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [dni, setDNI] = React.useState(props.dniPaciente);
  const [turnosAPI] = React.useState([]);
  let [rows, setRows ] = React.useState([]);

  useEffect(()=>{
    let array = [];
    async function componentDidMount() {
      console.log("Este es el dni a buscar: ", dni);
      let data = await getTurnosByDNI(dni);
      for(let i=0; i<data.data.length; i++) {
        turnosAPI.push(data.data[i]);
        array.push(createData(data.data[i].razon, data.data[i].fecha, data.data[i].profesional, data.data[i].estado));
        console.log(array[i]);
      }
      console.log("Estoy tiene rows: ", rows);
      console.log("esto es lo que tiene array: ", array);
      console.log("esto es lo que tiene rows despues de setar: ", rows);
    }
    componentDidMount();
  },[]);

  const handleSetDNI = (event) => {
    setDNI(event.target.value);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Eliminar el turno del servidor y de la pantalla
  const handleDeleteItem = (event, name) => {
    let date = new Date(2020, 8, 23, 15, 30)
    console.log(date)
    /* let datos = {
      dni: dni,
      fecha: name
    }
    let getLogin = await login(datos);
      if (getLogin.rdo===0 ) {
        removeTurnoFromScreen(name)
      }
      if (getLogin.rdo===1) {
        alert(getLogin.mensaje)
      } */
  };

  /* const removeTurnoFromScreen = (name) => {
    const selectedIndex = rows.indexOf(name);
    var array = [...rows];
    var index = array.indexOf(name)
    if (index !== -1) {
      array.splice(index, 1);
      rows=array;
    }
  } */

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const tableRow = (row, index) => {
    const isItemSelected = isSelected(row.razon);
    const labelId = `enhanced-table-checkbox-${index}`;
    console.log("Esta es una row");
    return (
      <TableRow
        hover
        onClick={(event) => handleClick(event, row.razon)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.razon}
        selected={isItemSelected}
      >
        <TableCell padding="checkbox">
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          {row.razon}
        </TableCell>
        <TableCell align="right">{row.fecha}</TableCell>
        <TableCell align="right">{row.profesional}</TableCell>
        <TableCell align="right">{row.estado}</TableCell>
        <TableCell>
          <Button onClick={(event) => handleDeleteItem(event, row)} color="secondary">
            Cancelar Turno
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            {<EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />}
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  {tableRow(row, index)}
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10]}
          component="div"
          labelRowsPerPage="Turnos por pagina"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}