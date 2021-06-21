import express from 'express';
import bodyParser from 'body-parser';
import excelExport from 'excel-export';
import query from '../models/query';

const router = express.Router();
const urlencodeParser = bodyParser.urlencoded({ extended: false });

let queryAllSQL = `SELECT employee.*, level.level, department.department
  FROM employee, level, department
  WHARE
    employee.levelId = level.id AND
    employee.departmentId = department.id`;

router.get('/getEmployee', async (req, res) => {
  const { name = '', departmentId } = req.query;

  let conditions = `AND  employee.name LIKE '%${name}%'`;

  if (departmentId) {
    conditions = conditions + `AND employee.departmentId=${departmentId}`;
  }

  const sql = `${queryAllSQL} ${conditions} ORDER BY employee.id DESC`;

  try {
    const result = await query(sql);

    res.json({
      code: 1,
      data: result
    });
  } catch (e: any) {
    res.json({
      code: 1,
      msg: e.toString()
    });
  }
});

router.post('/createEmployee', urlencodeParser, async (req, res) => {
  const { name, departmentId, hiredate, levelId } = req.body;

  const sql = `INSERT INTO employee (name, departmentId, hiredate, levelId)
    VALUES ('${name}', '${departmentId}', '${hiredate}', '${levelId}')`;

  try {
    const result = await query(sql);

    res.json({
      code: 1,
      data: {
        id: result.insertId
      }
    });
  } catch (e: any) {
    res.json({
      code: 1,
      msg: e.toString()
    });
  }
});

const conf: excelExport.Config = {
  cols: [
    { caption: '员工ID', type: 'number' },
    { caption: '姓名', type: 'string' },
    { caption: '部门', type: 'string' },
    { caption: '入职时间', type: 'string' },
    { caption: '职级', type: 'string' }
  ],
  rows: []
}

router.get('/downloadEmployee', async (req, res) => {
  try {
    let result = await query(queryAllSQL);

    conf.rows = result.map((i: any) => {
      return [i.id, i.name, i.department, i.hiredate, i.level];
    })

    let excel = excelExport.execute(conf);

    res.setHeader('Content-Type', 'application/vnd.openxmlormats');
    res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx');
    res.end(excel, 'binary');
  } catch (e: any) {
    res.end(e.toString());
  }
});

export default router;
