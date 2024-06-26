// routes/items.ts

import { Router, Request, Response, NextFunction } from 'express';
import { DB } from './modules/db';

export const router = Router();

router.delete('/deleteItem/:itemID', async (req, res) => {
  const { itemID } = req.params;
  console.log(`CALL DeleteItem(${itemID})`)
  try {
    console.log("deleting item")
    console.log(`CALL DeleteItem(${itemID})`)
    await DB.executeSQL(`CALL SP_DeleteItem(${itemID})`, function(err: any, data: any) {
      if (err) {
        console.log("ERROR: ", err);
        res.send("Error deleting item");
      } else {
        res.send("Success deleting item!");
      }
    })
  } catch (err) {
    console.error("ERROR: ", err);
    res.status(500).send("Error processing your request");
  }
});



router.get('/getAllItems', async (req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000)

  try {
    await DB.executeSQL('SELECT * FROM items', function(err: any, data: any) {
      if (err) {
        console.log("ERROR: ", err);
        res.send("Error getting all items");
      } else {
        res.send(data);
      }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/getAllUnsoldItems', async (req: Request, res: Response, next: NextFunction) => {
  console.log("ts getting all unsold items")
  req.setTimeout(30000)

  try {
    await DB.executeSQL('SELECT * FROM items WHERE soldStatus IS NULL AND reportedCount < 3', function(err: any, data: any) {
      if (err) {
        console.log("ERROR: ", err);
        res.send("Error getting all items");
      } else {
        res.send(data);
      }
    });
  } catch (e) {
    next(e);
  }
});


router.get('/getItemsByKeyWord', async (req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(10000)
  try {
    const keyword = req.query.keyword; // Get the keyword from the query string

    // Check if a keyword is provided, and construct the SQL query accordingly
    let sqlQuery = 'SELECT * FROM items WHERE ';
    const sqlParams: any[] = [];

    if (keyword) {
      const columnsToSearch = ['name', 'description', 'brand', 'color'];
      const conditions = columnsToSearch.map(column => `${column} LIKE '%${keyword}%'`).join(' OR ');

      sqlQuery += conditions;
    }

    // Execute the SQL query with parameters
      await DB.executeSQL(sqlQuery, function(err: any, data: any){
        if (err) {
          console.log("ERROR: ", err);
          res.send("Error getting items by keyword");
        } else {
          res.send(data)
        }
      });
    } catch (e) {
      next(e);
    }
});

router.get('/getItemsByUserID/itemID/:itemID', async (req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(10000)
  try {
    const itemID = req.params.itemID;

    let sqlQuery = 'SELECT * FROM items WHERE itemID = ' + itemID;

      await DB.executeSQL(sqlQuery, function(err: any, data: any){
        if (err) {
          console.log("ERROR: ", err);
          res.send("Error getting items by itemID");
        } else {
          res.send(data)
        }
      });
    } catch (e) {
      next(e);
    }
});

router.get('/getItemsByUserID/userID/:userID', async (req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(10000)
  try {
    const userID = req.params.userID;

    let sqlQuery = 'SELECT * FROM items WHERE userID = ' + userID + ' AND reportedCount < 3';

      await DB.executeSQL(sqlQuery, function(err: any, data: any){
        if (err) {
          console.log("ERROR: ", err);
          res.send("Error getting items by userID");
        } else {
          res.send(data)
        }
      });
    } catch (e) {
      next(e);
    }
});

// Add a new item

router.post("/addNewItem", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, quality, brand, color, hashtags, category, userID, photoURL, size } = req.body;

    const sp = "SP_InsertItem"; // Adjust the stored procedure name

    await DB.executeStoredProcedure(sp, { name, description, price, quality, brand, color, hashtags, category, userID, photoURL, size }, function(err, data) {
      if (err) {
        console.log("ERROR: ", err);
      } else {
        res.send(data);
      }
    });
  } catch (e) {
    next(e);
  }
});

// Update existing item
router.post('/updateItem/id/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemID = req.params.id;
    const { name, description, price, quality, brand, color, hashtags, category, userID, photoURL, size, soldStatus } = req.body;

    const sp = "SP_UpdateItem";

    await DB.executeStoredProcedure(sp, { itemID, name, description, price, quality, brand, color, hashtags, category, userID, photoURL, size, soldStatus }, function(err, data) {
      if(err) {
          console.log("ERROR: ", err);
      } else {
          res.send(data);
      }
    });
  } catch(e) {
    next(e);
  }
});

router.post('/updateSoldStatus/id/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemID = req.params.id;
    const { soldStatus } = req.body;

    const sp = "SP_UpdateSoldStatus";

    await DB.executeStoredProcedure(sp, { p_itemID: itemID, p_soldStatus: soldStatus }, function(err, data) {
      if(err) {
          console.log("ERROR updating sold status: ", err);
      } else {
          res.send(data);
      }
    });
  } catch(e) {
    next(e);
  }
});

// Report Item Posted
router.post('/report/id/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemID = req.params.id;
    const sp = "SP_IncreaseItemReportCount";

    await DB.executeStoredProcedure(sp, {itemID}, function(err, data) {
      if(err) {
          console.log("ERROR reporting in API: ", err);
      } else {
          res.send(data);
      }
    });
  } catch(e) {
    next(e);
  }
});
export default router;