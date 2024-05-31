
//connection
const express=require("express")
const XLSX = require('xlsx');
const mongoose=require("mongoose")
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
require("dotenv").config()
  const cors=require("cors")
  const app=express()
  const PORT=process.env.PORT || 8000;
  app.use(express.json())
  app.use(cors())

  mongoose.connect(process.env.MONGO_URI)
  .then(()=>{
    console.log("mongodb connected")
  }).catch((err)=>{
    console.log(err)
  })
  app.get("/",(req,res)=>{
      res.send("5May SMART folder server")
  })
  app.listen(PORT,()=>console.log(' server connected'));
  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }

  


























  //user
  const UserSchema =  mongoose.Schema({
  
    username: String,
    password: String,
   
  },{
    timestamps:true
  });
  
  const Usermod=mongoose.model("User",UserSchema)
  const jwt = require('jsonwebtoken');

// Function to generate JWT token with expiration time of 1 hour
function generateToken(userId) {
    return jwt.sign({ userId }, 'your-secret-key', { expiresIn: '1h' });
}
  app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by email
        const user = await Usermod.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare password
        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
     
        // Generate JWT token with user ID and expiration time of 1 hour
        const token = generateToken(user._id);

        // Return token and message upon successful login
        res.json({ success: true, message: 'Login successful', token, initial: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});





















const uploademp = multer()

const storageE = multer.diskStorage({
  destination: './uploadE/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadEmp = multer({
  storage: storageE,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);



const employerSchema = mongoose.Schema({
   id: { type: String, required: true },
  name: { type: String, required: true },
  nameInArabic: { type: String },
  idExpiryDate: { type: Date },
  bankShortName: { type: String },
  iban: { type: String },
  licenseexpiry: { type: String },
  taxicardexpiry: { type: String },
  crcardexpiry: { type: String },
  imagePath1: String,
  imagePath2: String,
  imagePath3: String,
  imagePath4: String
});

const Employer = mongoose.model('Employer', employerSchema);

app.use(express.json());
app.use('/uploadE', express.static(path.join(__dirname, 'uploadE')));

app.get('/api/employers', async (req, res) => {
  try {
    const employers = await Employer.find();
    res.json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employers', (req, res) => {
  uploadEmp(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const imagePath1 = req.files.image1 ? `/uploadE/${req.files.image1[0].filename}` : '';
    const imagePath2 = req.files.image2 ? `/uploadE/${req.files.image2[0].filename}` : '';
    const imagePath3 = req.files.image3 ? `/uploadE/${req.files.image3[0].filename}` : '';
    const imagePath4 = req.files.image4 ? `/uploadE/${req.files.image4[0].filename}` : '';

    const employer = new Employer({
      id: req.body.id,
            name: req.body.name,
            nameInArabic: req.body.nameInArabic,
            idExpiryDate: req.body.idExpiryDate,
            bankShortName: req.body.bankShortName,
            iban: req.body.iban,
            licenseexpiry: req.body.licenseexpiry,
            taxicardexpiry: req.body.taxicardexpiry,
            crcardexpiry: req.body.crcardexpiry,
      imagePath1: imagePath1,
      imagePath2: imagePath2,
      imagePath3: imagePath3,
      imagePath4: imagePath4
    });

    try {
      const newEmployer = await employer.save();
      res.status(201).json(newEmployer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

app.post('/api/employes/import', uploademp.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const Data = XLSX.utils.sheet_to_json(worksheet);

    await Employer.insertMany(Data);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// //employer
// const employerSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   name: { type: String, required: true },
//   nameInArabic: { type: String },
//   idExpiryDate: { type: Date },
//   bankShortName: { type: String },
//   iban: { type: String },
//   licenseexpiry: { type: String },
//   taxicardexpiry: { type: String },
//   crcardexpiry: { type: String },

// });

// const Employer = mongoose.model('Employer', employerSchema);

// // Get all employers
// app.get('/api/employers', async (req, res) => {
//   try {
//     const employers = await Employer.find();
//     res.json(employers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


// // Add a new employer
// app.post('/api/employers', async (req, res) => {


//     const employer = new Employer({
//       id: req.body.id,
//       name: req.body.name,
//       nameInArabic: req.body.nameInArabic,
//       idExpiryDate: req.body.idExpiryDate,
//       bankShortName: req.body.bankShortName,
//       iban: req.body.iban,
//       licenseexpiry: req.body.licenseexpiry,
//       taxicardexpiry: req.body.taxicardexpiry,
//       crcardexpiry: req.body.crcardexpiry,
     
//     });

//     try {
//       const newEmployer = await employer.save();
//       res.status(201).json(newEmployer);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   });


// // Import employers from Excel
// app.post('/api/employers/import', async (req, res) => {
//   try {
//     const file = req.files.file;
//     const workbook = XLSX.read(file.data, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const employersData = XLSX.utils.sheet_to_json(worksheet);
//     await Employer.insertMany(employersData);
//     res.status(201).json({ message: 'Employers imported successfully' });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

































const uploaddep = multer();


const departmentSchema = new mongoose.Schema({
  departmentid: { type: String, required: true },
  departmentname: { type: String, required: true },
  departmentnameInArabic: { type: String },
 
});

const Department = mongoose.model('Department', departmentSchema);

// Get all employers
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new employer
app.post('/api/departments', async (req, res) => {
  const department = new Department({
    departmentid: req.body.departmentid,
    departmentname: req.body.departmentname,
    departmentnameInArabic: req.body.departmentnameInArabic,
    
  });

  try {
    const newDepartment = await department.save();
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import employers from Excel

app.post('/api/departments/import', uploaddep.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await Department.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
































const uploadpos = multer();
const positionSchema = new mongoose.Schema({
  positionid: { type: String, required: true },
  positionname: { type: String, required: true },
  positionnameInArabic: { type: String },
 
});

const Position = mongoose.model('Position', positionSchema);

// Get all employers
app.get('/api/positions', async (req, res) => {
  try {
    const positions = await Position.find();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new employer
app.post('/api/positions', async (req, res) => {
  const position = new Position({
    positionid: req.body.positionid,
    positionname: req.body.positionname,
    positionnameInArabic: req.body.positionnameInArabic,
    
  });

  try {
    const newPosition = await position.save();
    res.status(201).json(newPosition);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import employers from Excel
app.post('/api/positions/import', uploadpos.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await position.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




























































const COMPANY_HR_PROFILESchema
=  mongoose.Schema({
    COM_NO:Number,
  WORK_HOURS:Number,
  WEEKLY_WORK_DAYS:Number,
  MONTHLY_WORK_DAYS:Number,
  BREAK_TIME:Number,
  FLEX_HOURS:String,
  AUTO_DEDUCT:String,
  AUTO_OVERTIME:String,
  WORK_MIN:Number,
  SAT_OVER_RATE:Number,
  SUN_OVER_RATE:Number,
  MON_OVER_RATE:Number,
  TUE_OVER_RATE:Number,
  WEN_OVER_RATE:Number,
  THU_OVER_RATE:Number,
  FRI_OVER_RATE:Number
 
},{
  timestamps:true
});

const COMPANY_HR_PROFILEmodel=mongoose.model("COMPANY_HR_PROFILE",COMPANY_HR_PROFILESchema)





































































const HR_EMPLOYEESSchema

=  mongoose.Schema({
  EMP_SERIAL
  :Number,
  EMP_NAME
:String,
EMP_NUMBER
:Number,
EMP_TITLE
:String,
  
  DATE_OF_BIRTH
:Date,
NATION_CODE
:String,
PERMANENT_ADDRESS
:String,
TEMPORARY_ADDRESS
:String,
PHONE
:String,
MOBILE
:String,
FAX
:String,
GENDER
:String,
SMOKER
:String,
MARTIAL_STATUS
:String,
RELIGIN
:String,
BLOD_TYPE
:String,
NATIONAL_NUMBER
:String,
MOTHER_NAME
:String,
EMAIL
:String,
BANK_CODE
:String,
BANK_BRANCH
:String,
ACCOUNT_NUMBER
:Number,
CAT_SERIAL
:Number,
POS_SERIAL
:Number,
DATE_OF_JOINE
:Date,
WORK_STATUS
:String,
HIRE_DATE
:Date,
DEPT_SERIAL
:Number,
COM_NO
:Number,
EMAIL2
:String,
IMAGE
:String

 
},{
  timestamps:true
});

const HR_EMPLOYEESmodel=mongoose.model("HR_EMPLOYEES"
,HR_EMPLOYEESSchema)




















































const HR_TRANSACTION_TYPESSchema
=mongoose.Schema({
  TRANS_SERIAL:Number,
  TRANS_CODE:String,
  TRANS_DESC_E:String,
  TRANS_DESC_A:String




},{
  timestamps:true
});


const HR_TRANSACTION_TYPESmodel=mongoose.model("HR_TRANSACTION_TYPES",HR_TRANSACTION_TYPESSchema)
















































const HR_TRANSACTIONSSchema

=mongoose.Schema({
  HR_TRANS_SERIAL
  :Number,
  EMP_SERIAL
:Number,
TRANS_SERIAL
:Number,
TRANS_DAT
:Date,
TRANS_DESC:String,
EFFECT_DATE:Date,
UPDATE_STAT:String,
FLAG:String,
NEW_POS_SERIAL:Number,
RESIGN_DATE:Date,
BASIC_VALUE:Number,
ELEMENT_SERIAL:Number,
DEPT_SERIAL:Number,
CAT_SERIAL:Number,
COM_NO:Number
},{
  timestamps:true
}
)

const HR_TRANSACTIONSmodel=mongoose.model("HR_TRANSACTIONS",HR_EMPLOYEESSchema)












































































































const HRMS_EMP_TIME_SHEETSchema=mongoose.Schema({
  EMP_SERIAL:Number,
  EMP_NAME:String,
  DAT:Date,
  TIME:Date,
  STATUS:String,
  LOC_NAME:String,
  CREATED_DATE:Date


},
{timestamps:true})

const HRMS_EMP_TIME_SHEETmodel=mongoose.model("HRMS_EMP_TIME_SHEET",HRMS_EMP_TIME_SHEETSchema)





































































const HRMS_EMPLOYEE_SCHEDULESchema=mongoose.Schema({
  ES_SERIAL:Number,
  EMP_SERIAL:Number,
  WORK_SCHEDULE_CODE:Number,
  START_DATE:Date,
  END_DATE:Date,
  CREATED_DATE:Date,
  CREATED_BY:String,
  ACTIVE:String,
  LOC_ID:Number
},{
  timestamps:true
})
const HRMS_EMPLOYEE_SCHEDULEmodel=mongoose.model("HRMS_EMPLOYEE_SCHEDULE",HRMS_EMPLOYEE_SCHEDULESchema)































































const HRMS_EMPLOYEESSchema=mongoose.Schema({
  EMP_SERIAL:Number,
EMP_NAME:String,
EMP_NUMBER:Number,
EMP_TITLE:String,
DATE_OF_BIRTH:Date,
NATION_CODE:String,
PERMANENT_ADDRESS:String,
TEMPORARY_ADDRESS:String,
PHONE:String,
MOBILE:String,
FAX:String,
GENDER:String,
SMOKER:String,
MARTIAL_STATUS:String,
RELIGIN:String,
BLOD_TYPE:String,
NATIONAL_NUMBER:String,
MOTHER_NAME:String,
EMAIL:String,
BANK_CODE:String,
BANK_BRANCH:String,
ACCOUNT_NUMBER:String,
CAT_SERIAL:Number,
POS_CODE:Number,
DATE_OF_JOINE:Date,
WORK_STATUS:String,
RESIGN_DATE:Date,
DEPTNO:Number,
COM_NO:Number,
EMAIL2:String,
IMAGE:String,

LOC_ID:Number,
EMPLOYER_ID:Number,
MIMETYPE:String,
FILENAME:String,
IMAGE_LAST_UPDATE:String,
VISA_ID:String

})


const HRMS_EMPLOYEESmodel=mongoose.model('HRMS_EMPLOYEES',HRMS_EMPLOYEESSchema)





























































const HRMS_LEAVE_FREQSchema
=mongoose.Schema({
  LEAVE_FREQ_CODE:Number,
  LEAVE_FREQ_NAME:String,
  LTYPE_SERIAL:Number,
  NUMBER_OF_DAYS:Number,
  FREQUENCY:String,
  LIFE_TIME_FREQUENCY:String,
  LIFE_TIME_TYPE:String,
  EMP_SERIAL:Number
  

},{
  timestamps:true
})


const HRMS_LEAVE_FREQmodel=mongoose.model('HRMS_LEAVE_FREQ',HRMS_LEAVE_FREQSchema)






















































// const storageloc = multer.memoryStorage();
// const uploadloc = multer({ storage: storageloc });
// const HRMS_LOCATIONSSchema=mongoose.Schema({
//   LOC_ID:Number,
//   LOC_NAME:String,
//   LOC_NAME_A:String
// })
// const HRMS_LOCATIONSmodel=mongoose.model('HRMS_LOCATIONS',HRMS_LOCATIONSSchema)
// app.get('/api/locations', async (req, res) => {
//   try {
//     const locations = await HRMS_LOCATIONSmodel.find();
//     res.json(locations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add a new employer
// app.post('/api/locations', async (req, res) => {
//   const location = new HRMS_LOCATIONSmodel({
//     LOC_ID: req.body.LOC_ID,
//     LOC_NAME: req.body.LOC_NAME,
//     LOC_NAME_A: req.body.LOC_NAME_A,
    
//   });

//   try {
//     const newLocation = await location.save();
//     res.status(201).json(newLocation);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// app.post('/api/locations/import', uploadloc.single('file'), async (req, res) => {
//   try {
//     const file = req.file;
//     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const locationsData = XLSX.utils.sheet_to_json(worksheet);
//     await HRMS_LOCATIONSmodel.insertMany(locationsData);
//     res.status(201).json({ message: 'Locations imported successfully' });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Export locations to Excel
// app.get('/api/locations/export', async (req, res) => {
//   try {
//     const locations = await HRMS_LOCATIONSmodel.find();
//     const worksheet = XLSX.utils.json_to_sheet(locations);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Locations');

//     const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

//     res.setHeader('Content-Disposition', 'attachment; filename=locations.xlsx');
//     res.setHeader('Content-Type', 'application/octet-stream');
//     res.send(buffer);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
const uploadloc = multer(); // Multer configuration for file upload

// Mongoose Schema and Model
const HRMS_LOCATIONSSchema = new mongoose.Schema({
  LOC_ID: Number,
  LOC_NAME: String,
  LOC_NAME_A: String
});
const HRMS_LOCATIONSmodel = mongoose.model('HRMS_LOCATIONS', HRMS_LOCATIONSSchema);

// Routes
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await HRMS_LOCATIONSmodel.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/locations', async (req, res) => {
  const location = new HRMS_LOCATIONSmodel({
    LOC_ID: req.body.LOC_ID,
    LOC_NAME: req.body.LOC_NAME,
    LOC_NAME_A: req.body.LOC_NAME_A
  });

  try {
    const newLocation = await location.save();
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import Locations from Excel
app.post('/api/locations/import', uploadloc.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await HRMS_LOCATIONSmodel.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// const HRMS_LOCATIONSSchema=mongoose.Schema({
//   LOC_ID:Number,
//   LOC_NAME:String,
//   LOC_NAME_A:String
// })
// const HRMS_LOCATIONSmodel=mongoose.model('HRMS_LOCATIONS',HRMS_LOCATIONSSchema)
// app.get('/api/locations', async (req, res) => {
//   try {
//     const locations = await HRMS_LOCATIONSmodel.find();
//     res.json(locations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add a new employer
// app.post('/api/locations', async (req, res) => {
//   const location = new HRMS_LOCATIONSmodel({
//     LOC_ID: req.body.LOC_ID,
//     LOC_NAME: req.body.LOC_NAME,
//     LOC_NAME_A: req.body.LOC_NAME_A,
    
//   });

//   try {
//     const newLocation = await location.save();
//     res.status(201).json(newLocation);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Import employers from Excel
// app.post('/api/locations/import', async (req, res) => {
//   try {
//     const file = req.files.file;
//     const workbook = XLSX.read(file.data, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const locationsData = XLSX.utils.sheet_to_json(worksheet);
//     await HRMS_LOCATIONSmodel.insertMany(locationsData);
//     res.status(201).json({ message: 'Locations imported successfully' });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });





















const HRMS_OVERTIMESchema=mongoose.Schema({
  OVERTIME_CODE:Number,
OVERTIME_NAME:String,
OVERTIME_DESC:String,
SAT_OVERTIME_RATE:Number,
SUN_OVERTIME_RATE:Number,
MON_OVERTIME_RATE:Number,
TUE_OVERTIME_RATE:Number,
WEN_OVERTIME_RATE:Number,
THU_OVERTIME_RATE:Number,
FRI_OVERTIME_RATE:Number,
ACTIVE:String

},{
  timestamps:true
})
const HRMS_OVERTIMEmodel=mongoose.model('HRMS_OVERTIME',HRMS_OVERTIMESchema)
































const HRMS_WORK_SCHEDULESchema=mongoose.Schema({
  WORK_SCHEDULE_CODE:Number,
WORK_SCHEDULE_NAME:String,
WORK_SCHEDULE_DESC:String,
WORK_SCHEDULE_BREAK:String,
WORK_TIME_FROM:Date,
WORK_TIME_TO:Date,
BREAK_TIME_FROM:Date,
BREAK_TIME_TO:Date,
WEEKLY_WORK_DAYS:Number,
ACTIVE:String,
LATENCY_ALLOWED:Number,
CREATED_DATE:Date,
CREATED_BY:String,
UPDATED_DATE:Date,
UPDATED_BY:String,
WORK_SCHEDULE_TYPE:String

},{
  timestamps:true
})
const HRMS_WORK_SCHEDULEmodel=mongoose.model('HRMS_WORK_SCHEDULE',HRMS_WORK_SCHEDULESchema)




















































const uploadnat = multer()


const NATIONALITYSchema=mongoose.Schema({
  NATION_CODE:String,
NAME_E:String,
NAME_A:String

},{
  timestamps:true
})
const NATIONALITYmodel=mongoose.model('NATIONALITY',NATIONALITYSchema)

app.get('/api/nationalities', async (req, res) => {
  try {
    const locations = await NATIONALITYmodel.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new employer
app.post('/api/nationalities', async (req, res) => {
  const nationalitie = new NATIONALITYmodel({
    NATION_CODE: req.body.NATION_CODE,
    NAME_E: req.body.NAME_E,
    NAME_A: req.body.NAME_A,
    
  });

  try {
    const newNationalitie = await nationalitie.save();
    res.status(201).json(newNationalitie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import employers from Excel
app.post('/api/nationalities/import', uploadnat.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const Data = XLSX.utils.sheet_to_json(worksheet);

    await NATIONALITYmodel.insertMany(Data);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});









































const OVERTIME_TYPESSchema=mongoose.Schema({
  OV_TIME_TYP:String,
DESC_E:String,
DESC_A:String,
HOURLY_RATE:Number

})


const  OVERTIME_TYPESmodel=mongoose.model('OVERTIME_TYPES',OVERTIME_TYPESSchema)




































const PASSPORTSchema=mongoose.Schema({
  EMP_SERIAL:Number,
PASS_NUMBER:String,
PASS_DATE:Date,
PASS_ENTRY_DATE:Date,
PASS_EXPIRE_DATE:Date,
RES_NUMBER:Number,
RES_EXPIRE_DATE:Date

})
const  PASSPORTmodel=mongoose.model('PASSPORT',PASSPORTSchema)


























const ORGANIZATION_UNIT_TYPESSchema=mongoose.Schema({
  ORGUNIT_TYPE:String,
NAME_E:String,
NAME_A:String,
ORGUNITTYP_LEVEL:Number

})


const ORGANIZATION_UNIT_TYPESmodel=mongoose.model('ORGANIZATION_UNIT_TYPES',ORGANIZATION_UNIT_TYPESSchema)



































const ORGANIZATION_UNITSSchema=mongoose.Schema({
  COM_NO:Number,
ORGUNIT_SEQ:Number,
NAME_E:String,
NAME_A:String,
STATUS:String,
ORGUNIT_TYPE:String,
ORGUNIT_REF_SEQ:String,
ORGUNIT_SEQ_PARENT:Number

})
const ORGANIZATION_UNITSmodel=mongoose.model('ORGANIZATION_UNITS',ORGANIZATION_UNITSSchema)






























const ATTENDENCESchema=mongoose.Schema({
  EMP_NUMBER:Number,
DATE_IN:Date,
DATE_OUT:Date,
TIME_IN:Date,
TIME_OUT:Date,
TOT_HOURS_ATT:String,
COM_NO:Number

})

const ATTENDENCEmodel=mongoose.model('ATTENDENCE',ATTENDENCESchema)


































const uploadban = multer();

const BANKSSchema=mongoose.Schema({
  BANK_CODE:String,
NAME_E:String,
NAME_A:String,

BANK_SEQ:Number,
BANK_REF_SEQ:String,
BANK_CODE_PARENT:String,
SHORT_NAME:String,
STR_CODE:String

})


const BANKSmodel=mongoose.model('BANKS',BANKSSchema)
app.get('/api/banks', async (req, res) => {
  try {
    const banks = await BANKSmodel.find();
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new employer
app.post('/api/banks', async (req, res) => {
  const bank = new BANKSmodel({
    BANK_CODE: req.body.BANK_CODE,
    NAME_E: req.body.NAME_E,
    NAME_A: req.body.NAME_A,
    BANK_SEQ:req.body.BANK_SEQ,
    BANK_REF_SEQ:req.body.BANK_REF_SEQ,
    BANK_CODE_PARENT:req.body.BANK_CODE_PARENT,
    SHORT_NAME:req.body.SHORT_NAME,
    STR_CODE:req.body.STR_CODE
    
  });

  try {
    const newbank = await BANKSmodel.save();
    res.status(201).json(newbank);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import employers from Excel

app.post('/api/banks/import', uploadban.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await BANKSmodel.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});































const CONTRACT_EMPLOYEESSchema=mongoose.Schema({
  CONEMP_SERIAL:Number,
CON_SERIAL:Number,
EMP_SERIAL:Number,
DAT:Date,
STATUS:String,
POSITION:String,
REMARKS:String

})
const CONTRACT_EMPLOYEESmodel=mongoose.model('CONTRACT_EMPLOYEES',CONTRACT_EMPLOYEESSchema)

























const COUNTRIESSchema=mongoose.Schema({
  COUNTRY_ID:Number,
COUNTRY_CODE:String,
NAME_E:String,
NAME_A:String,
SUFFIX:String

})
const COUNTRIESmodel=mongoose.model('COUNTRIES',COUNTRIESSchema)























const DOCUMENTSSchema=mongoose.Schema({
  DOC_SERIAL:Number,
EMP_SERIAL:Number,
DOC_TYPE:String,
DOC_TITLE:String,
DOC_DESC:String,
DOC_REF_NUMBER:String,
ATTACHMENT:String,
DOC_EXPIRY_DATE:Date

})
const DOCUMENTSmodel=mongoose.model('DOCUMENTS',DOCUMENTSSchema)


































const ELEMENT_CATEGORIESSchema=mongoose.Schema({
ECAT_SERIAL:Number,
ECAT_CODE:String,
DESC_E:String,
DESC_A:String,
EFFECT:Number

})

const ELEMENT_CATEGORIESmodel=mongoose.model('ELEMENT_CATEGORIES',ELEMENT_CATEGORIESSchema)


































const ELEMENT_EMPLOYEESSchema=mongoose.Schema({
  ELE_SERIAL:Number,
ELEMENT_SERIAL:Number,
EMP_SERIAL:Number,
ELE_VALUE:Number,
ELE_VALUE_TYPE:String,
ELEMENT_DAT:Date,
PERCENTAGE:String,
ELEMENT_TO_DAT:Date

})
const ELEMENT_EMPLOYEESmodel=mongoose.model('ELEMENT_EMPLOYEES',ELEMENT_EMPLOYEESSchema)




































const ELEMENT_TYPESSchema=mongoose.Schema({
  ETYP_SERIAL:Number,
ECAT_SERIAL:Number,
ETYP_CODE:String,
NAME_E:String,
NAME_A:String

})

const ELEMENT_TYPESmodel=mongoose.model('ELEMENT_TYPES',ELEMENT_TYPESSchema)






























const ELEMENTSSchema=mongoose.Schema({
  ELEMENT_SERIAL:Number,
ELEMENT_CODE:String,
ELEMENT_DESC:String,
ELEMENT_TYPE:String,
ELEMENT_MAX_VAL:Number,
ELEMENT_VALUE_TYPE:String,
INCLUDE_DURING_VAC:String

})
const ELEMENTSmodel=mongoose.model('ELEMENTS',ELEMENTSSchema)





















const EMP_CERTIFICATIONSSchema=mongoose.Schema({
  EMP_SERIAL:Number,
CERTIFICATION_NAME:String,
CERTIFICATION_AUTHORITY:String,
LICENSE_NUMBER:String,
CERT_START_DAT:Date,
CERT_END_DAT:Date,
CERT_EXP:String

})
const EMP_CERTIFICATIONSmodel=mongoose.model('EMP_CERTIFICATIONS',EMP_CERTIFICATIONSSchema)

































const EMP_COURSESSchema=mongoose.Schema({
  EMP_SERIAL:Number,
COURSE_NAME:String,
COURSE_NUMBER:String,
ASSOCIATED_WITH:String

})
const EMP_COURSESmodel=mongoose.model('EMP_COURSES',EMP_COURSESSchema)


































const EMP_EDUCATIONSchema=mongoose.Schema({
  EMP_SERIAL:Number,
SCHOOL:String,
YEAR_ATTENDED:String,
DEGREE:String,
FIELD_OF_STUDY:String,
GRADE:String,
DESCREPTION:String

})
const EMP_EDUCATIONmodel=mongoose.model('EMP_EDUCATION',EMP_EDUCATIONSchema)






























const EMP_LANGSchema=mongoose.Schema({
  EMP_SERIAL:Number,
LANGUAGE:String,
PROFICIENCY:String

})
const EMP_LANGmodel=mongoose.model('EMP_LANG',EMP_LANGSchema)














































const uploadcom = multer()
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image');



const COMMITMENTSSchema = mongoose.Schema({
  COMMITMENT_ID: String,
  NAME_E: String,
  NAME_A: String,
  D: String,
  imagePath: String
});

const COMMITMENTSmodel = mongoose.model('COMMITMENTS', COMMITMENTSSchema);

app.use(express.json());
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/commits', async (req, res) => {
  try {
    const commitments = await COMMITMENTSmodel.find();
    res.json(commitments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/commits', async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const commitment = new COMMITMENTSmodel({
      COMMITMENT_ID: req.body.COMMITMENT_ID,
      NAME_E: req.body.NAME_E,
      NAME_A: req.body.NAME_A,
      D: req.body.D,
      imagePath: `/uploads/${req.file.filename}`
    });

    try {
      const newCommitment = await commitment.save();
      res.status(201).json(newCommitment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});
app.post('/api/commits/import', uploadcom.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const Data = XLSX.utils.sheet_to_json(worksheet);

    await COMMITMENTSmodel.insertMany(Data);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import employers from Excel (you can leave this as is)
// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, // 1MB limit
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = fileTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb('Error: Images Only!');
//     }
//   }
// });

// const COMMITMENTSSchema = mongoose.Schema({
//   COMMITMENT_ID: String,
//   NAME_E: String,
//   NAME_A: String,
//   D: String,
//   imagePaths: [String]
// });

// const COMMITMENTSmodel = mongoose.model('COMMITMENTS', COMMITMENTSSchema);

// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('/api/commits', async (req, res) => {
//   try {
//     const commitments = await COMMITMENTSmodel.find();
//     res.json(commitments);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/api/commits', (req, res) => {
//   upload.array('images', 4)(req, res, async (err) => { // Allow up to 4 images
//     if (err) {
//       return res.status(400).json({ message: err.message });
//     }
//     if (!req.files) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }
//     const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

//     const commitment = new COMMITMENTSmodel({
//       COMMITMENT_ID: req.body.COMMITMENT_ID,
//       NAME_E: req.body.NAME_E,
//       NAME_A: req.body.NAME_A,
//       D: req.body.D,
//       imagePaths: imagePaths
//     });

//     try {
//       const newCommitment = await commitment.save();
//       res.status(201).json(newCommitment);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   });
// });

// app.post('/api/commits/import', upload.single('file'), async (req, res) => {
//   try {
//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
//     const commitments = worksheet.map(row => ({
//       COMMITMENT_ID: row.COMMITMENT_ID,
//       NAME_E: row.NAME_E,
//       NAME_A: row.NAME_A,
//       D: row.D,
//       imagePaths: row.imagePaths.split(',') // Assuming image paths are comma-separated
//     }));
    
//     await COMMITMENTSmodel.insertMany(commitments);
//     res.status(201).json({ message: 'Commitments imported successfully' });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// app.get('/api/commits/export', async (req, res) => {
//   try {
//     const commitments = await COMMITMENTSmodel.find();
//     const data = commitments.map(commit => ({
//       COMMITMENT_ID: commit.COMMITMENT_ID,
//       NAME_E: commit.NAME_E,
//       NAME_A: commit.NAME_A,
//       D: commit.D,
//       imagePaths: commit.imagePaths.join(',')
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Commitments');
//     const filePath = path.join(__dirname, 'uploads', 'commitments.xlsx');
//     XLSX.writeFile(workbook, filePath);
//     res.download(filePath);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });







































const EQUIPMENTSSchema=mongoose.Schema({
  EQU_SERIAL:Number,
CON_SERIAL:Number,
EQUCAT_SERIAL:Number,
REF_NO:String,
REAMRKS:String

})
const EQUIPMENTSmodel=mongoose.model('EQUIPMENTS',EQUIPMENTSSchema)
































const FAMILY_EMPL_MEMBERSSchema=mongoose.Schema({
  EMP_SERIAL:Number,
FAM_NAME:String,
FAM_DATE_OF_BIRTH:Date,
FAM_RELATIONSHIP:String,
FAM_PASSPORT_NUM:String,
FAM_PASSPORT_EXPIRE:Date,
FAM_RES_NUM:String,
FAM_RES_EXPIRE:Date

})
const FAMILY_EMPL_MEMBERSmodel=mongoose.model('FAMILY_EMPL_MEMBERS',FAMILY_EMPL_MEMBERSSchema)





























const LEAVE_TYPESSchema=mongoose.Schema({
  LTYPE_SERIAL:Number,
LTYPE_CODE:String,
LTYPE_DESC:String,
LTYPE_DESC_A:String

})
const LEAVE_TYPESmodel=mongoose.model('LEAVE_TYPES',LEAVE_TYPESSchema)
































const LEAVESSchema=mongoose.Schema({
  LEAVE_SERIAL:Number,
EMP_SERIAL:Number,
LEAVE_FROM:Date,
LEAVE_TO:Date,
LEAVE_TYPE:Number,
LEAVE_DAT:Date,
LEAVE_REQUEST_DAT:Date,
FROM_HOUR:Date,
TO_HOUR:Date,
TOT_DAYS:Number,
TOT_HOURS:Number,
TOT_MIN:Number,
DUTY_RESUMPTION:Date,
COM_NO:Number

})
const LEAVESmodel=mongoose.model('LEAVES',LEAVESSchema)


































const PAYROLLSSchema=mongoose.Schema({
  PAY_SERIAL:Number,
COM_NO:Number,
FINPER_YEAR:Number,
EMP_SERIAL:Number,
EMPEL_SERIAL:Number,
AMT:Number,
REAMRKS:String

})
const PAYROLLSmodel=mongoose.model('PAYROLLS',PAYROLLSSchema)

































const SALARIESSchema=mongoose.Schema({
  SALARY_SERIAL:Number,
EMP_SERIAL:Number,
SALARY_VALUE:String,
SALARY_DAT:Date,
BASIC:String,
ALLOWNCES:String,
DISCOUNTS:String,
FLAG:String,
COM_NO:Number,
SALARY_FREQUENCY:String,
SALARY_MONTH:Date

})
const SALARIESmodel=mongoose.model('SALARIES',SALARIESSchema)

























const SALARY_ELEMENTSSchema=mongoose.Schema({
  SERIAL:Number,
EMP_SERIAL:Number,
AMOUNT:Number,
DESCREPTION:String,
EFFECT:String,
CREATED_DAT:Date,
CREATED_BY:String,
UPDATED_BY:Date,
STATUS:String,
FROM_DATE:Date,
TO_DATE:Date,

})
const SALARY_ELEMENTS=mongoose.model('SALARY_ELEMENTS',SALARY_ELEMENTSSchema)












































const TEMP_SALARIESSchema=mongoose.Schema({
  TSALARY_SERIAL:Number,
EMP_SERIAL:Number,
SALARY_VALUE:String,
SALARY_DAT:Date,
BASIC:String,
ALLOWNCES:String,
DISCOUNTS:String,
FLAG:String,
COM_NO:Number

})
const TEMP_SALARIESmodel=mongoose.model('TEMP_SALARIES',TEMP_SALARIESSchema)











































const USERS_INFORMATIONSchema=mongoose.Schema({
  USRINFO_USERNAME:String,
NAME_E:String,
NAME_A:String,
ACTIVE:String,
EMAIL_ACCOUNT:String,
EMAIL_ACC_NAME:String,
USR_PASSWORD:String,
USR_PASSWORD_LAST_MODIFIED:String,
PREFFERED_LANG:Date,
CREATED_DAT:String,
NO_OF_LOGONS:Number,
REMARKS:String,
TYPE:String,
SUPER_USER:String,
SPECIALTY:String

})
const USERS_INFORMATIONmodel=mongoose.model('USERS_INFORMATIONS',USERS_INFORMATIONSchema)











































const VACATIONS_WITH_DEDSchema=mongoose.Schema({
  LEAVE_SERIAL:Number,
EMP_SERIAL:Number,
EX_DAYS:Number,
EX_HOURS:Number,
EX_MIN:Number,
FLAG:Number,
FROM_DATE:Date,
TO_DATE:Date,
VALUE:Number,
S_DAT:Date

})
const VACATIONS_WITH_DEDmodel=mongoose.model('VACATIONS_WITH_DED',VACATIONS_WITH_DEDSchema)































const uploadvac = multer();

const VACATIONSSchema=mongoose.Schema({
  vacationid:Number,
  vacationtype:String,
  vacationtypeA:String
})

const VACATIONSSmodel=mongoose.model('VACATIONS',VACATIONSSchema)

// Get all employers
app.get('/api/vacations', async (req, res) => {
  try {
    const vacations = await VACATIONSSmodel.find();
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/vacations', async (req, res) => {
  const vacation = new VACATIONSSmodel({
    vacationid: req.body.vacationid,
    vacationtype: req.body.vacationtype,
    vacationtypeA: req.body.vacationtypeA,
    
  });

  try {
    const newVacation = await vacation.save();
    res.status(201).json(newVacation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/vacations/import', uploadvac.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await VACATIONSSmodel.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



const uploademps = multer();




const employeesSchema=mongoose.Schema({
  Name:String,
  Birthdaydate:String,
  age:Number,
  EmployeeID:Number,
  Qid:String,
  Nationality:String,
  Title:String,
  Status:String,
  BloodType:String,
  Religion:String,
  Smoker:String,
  empimage:String,
  Gender:String,

  Hiredate:String,
  Employer:String,
  Worklocation:String,
  Job:String,
  Department:String,
  WorkingStatus:String,
  Resign:String,



  Bankacc:String,
  Bankname:String,
  iban:String,
  BankCode:String,




  Phone:String,
  Email:String,
  Mobile:String,
  Fax:String,
  currentAddress:String,
  HomeAddress:String,
 
  
 



})



const employeesmodel=mongoose.model('employees',employeesSchema)
app.get('/api/employes', async (req, res) => {
  try {
    const employes = await employeesmodel.find();
    res.json(employes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new employer
app.post('/api/employes', async (req, res) => {
  const employe = new employeesmodel({
    Name:req.body.Name,
    Birthdaydate:req.body.Birthdaydate,
    age:req.body.age,
    EmployeeID:req.body.EmployeeID,
    Qid:req.body.Qid,
    Nationality:req.body.Nationality,
    Title:req.body.Title,
    Status:req.body.Status,
    BloodType:req.body.BloodType,
    Religion:req.body.Religion,
    Smoker:req.body.Smoker,
    empimage:req.body.empimage,
    Gender:req.body.Gender,
  
    Hiredate:req.body.Hiredate,
    Employer:req.body.Employer,
    Worklocation:req.body.Worklocation,
    Job:req.body.Job,
    Department:req.body.Department,
    WorkingStatus:req.body.WorkingStatus,
    Resign:req.body.Resign,
  
  
  
    Bankacc:req.body.Bankacc,
    Bankname:req.body.Bankname,
    iban:req.body.iban,
    BankCode:req.body.BankCode,
  
  
  
  
    Phone:req.body.Phone,
    Email:req.body.Email,
    Mobile:req.body.Mobile,
    Fax:req.body.Fax,
    currentAddress:req.body.currentAddress,
    HomeAddress:req.body.HomeAddress,
    
  });

  try {
    const newemployee = await employe.save();
    res.status(201).json(newemployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import employers from Excel

app.post('/api/employes/import', uploademps.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await employeesmodel.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// const uploademps = multer();

// // Define the employee schema
// const employeesSchema = new mongoose.Schema({
//   EmployeeID: Number,
//   Name: String,
//   Job: String,
//   Department: String,
//   Employer: String,
//   Worklocation: String,
//   Nationality: String,
//   Gender: String,
//   Bankacc: String,
//   Hiredate: Date,
//   Birthdaydate: Date,
//   Phone: String,
//   Mobile: String,
//   Email: String,
//   Status: String, // Fixed typo from 'status' to 'Status'
//   BankCode: String
// });

// const employeesmodel = mongoose.model('employees', employeesSchema);

// // Fetch all employees
// app.get('/api/employes', async (req, res) => {
//   try {
//     const employes = await employeesmodel.find();
//     res.json(employes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Add a new employee
// app.post('/api/employes', async (req, res) => {
//   const employe = new employeesmodel(req.body);

//   try {
//     const newemployee = await employe.save();
//     res.status(201).json(newemployee);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Import employees from Excel
// app.post('/api/employes/import', uploademps.single('file'), async (req, res) => {
//   try {
//     const file = req.file;
//     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const employeesData = XLSX.utils.sheet_to_json(worksheet);

//     await employeesmodel.insertMany(employeesData);
//     res.status(201).json({ message: 'Employees imported successfully' });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });


const uploadatt = multer();

const attendenceSchema=mongoose.Schema({
  FirstName:String,
  LastName:String,
  ID:Number,
  Department:String,
  Date:String,
  Weekday:String,
  Timetable:String,
  WorkStartDate:String,
  WorkStartTime:String,
  WorkEndDate:String,
  WorkEndTime:String,
  ClockInDate:String,
  ClockInTime:String,
  ClockInsource:String,
  ClockOutDate:String,
  ClockOutTime:String,
  ClockOutsource:String,
  AttendenceStatus:String,
  WorkedHours:String,
  AbsentDuration:String,
  LateDuration:String,
  EarlyLeaveDuration:String,
  BreakDuration:String,
  LeaveDuration:String,
  OvertimeDuration:String,
  WorkdayOvertimeDuration:String,
  WeekendOvertimeDuration:String
})

const attendenceSmodel=mongoose.model('Attendence',attendenceSchema)

// Get all employers
app.get('/api/attendence', async (req, res) => {
  try {
    const vacations = await attendenceSmodel.find();
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendence', async (req, res) => {
  const vacation = new attendenceSmodel({
    FirstName:req.body.FirstName,
    LastName:req.body.LastName,
    ID:req.body.ID,
    Department:req.body.Department,
    Date:req.body.Date,
    Weekday:req.body.Weekday,
    Timetable:req.body.Timetable,
    WorkStartDate:req.body.WorkStartDate,
    WorkStartTime:req.body.WorkStartTime,
    WorkEndDate:req.body.WorkEndDate,
    WorkEndTime:req.body.WorkEndTime,
    ClockInDate:req.body.ClockInDate,
    ClockInTime:req.body.ClockInTime,
    ClockInsource:req.body.ClockInsource,
    ClockOutDate:req.body.ClockOutDate,
    ClockOutTime:req.body.ClockOutTime,
    ClockOutsource:req.body.ClockOutsource,
    AttendenceStatus:req.body.AttendenceStatus,
    WorkedHours:req.body.WorkedHours,
    AbsentDuration:req.body.AbsentDuration,
    LateDuration:req.body.LateDuration,
    EarlyLeaveDuration:req.body.EarlyLeaveDuration,
    BreakDuration:req.body.BreakDuration,
    LeaveDuration:req.body.LeaveDuration,
    OvertimeDuration:req.body.OvertimeDuration,
    WorkdayOvertimeDuration:req.body.WorkdayOvertimeDuration,
    WeekendOvertimeDuration:req.body.WeekendOvertimeDuration
    
  });

  try {
    const newVacation = await vacation.save();
    res.status(201).json(newVacation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/attendence/import', uploadatt.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await attendenceSmodel.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




const uploadsal = multer();

const salarySchema=mongoose.Schema({
  EMPCODE:Number,
   NAMEINENGLISH:String,
   NAMEINARBI:String,
   DESIGNATION:String,
   BRANCH:String,
   BASICSALARY:String,
   INCREMENT:String,
   ACCOMODATION:String,
   TRANSPORTATION:String,
   TICKET:String,
   TOTALSALARY:String,
   WORKDAYS:String,
   CURRENTSALARY:String,
   OVERTIME:String,
   ANNUALLEAVEPAYMENT:String,
   PERFORMANCEALLOWANCE:String,
   OTHERADD:String,
   TOTALWAGES:String,
   LOAN:String,
   LATE:String,
   ABSENT:String,
   OTHERDEDUCTION:String,
   NETSALARY:String
})

const salarySmodel=mongoose.model('Salary',salarySchema)

// Get all employers
app.get('/api/salary', async (req, res) => {
  try {
    const vacations = await salarySmodel.find();
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/salary', async (req, res) => {
  const vacation = new salarySmodel({
    EMPCODE:req.body.EMPCODE,
   NAMEINENGLISH:req.body.NAMEINENGLISH,
   NAMEINARBI:req.body.NAMEINARBI,
   DESIGNATION:req.body.DESIGNATION,
   BRANCH:req.body.BRANCH,
   BASICSALARY:req.body.BASICSALARY,
   INCREMENT:req.body.INCREMENT,
   ACCOMODATION:req.body.ACCOMODATION,
   TRANSPORTATION:req.body.TRANSPORTATION,
   TICKET:req.body.TICKET,
   TOTALSALARY:req.body.TOTALSALARY,
   WORKDAYS:req.body.WORKDAYS,
   CURRENTSALARY:req.body.CURRENTSALARY,
   OVERTIME:req.body.OVERTIME,
   ANNUALLEAVEPAYMENT:req.body.ANNUALLEAVEPAYMENT,
   PERFORMANCEALLOWANCE:req.body.PERFORMANCEALLOWANCE,
   OTHERADD:req.body.OTHERADD,
   TOTALWAGES:req.body.TOTALWAGES,
   LOAN:req.body.LOAN,
   LATE:req.body.LATE,
   ABSENT:req.body.ABSENT,
   OTHERDEDUCTION:req.body.OTHERDEDUCTION,
   NETSALARY:req.body.NETSALARY
  });

  try {
    const newVacation = await vacation.save();
    res.status(201).json(newVacation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/salary/import', uploadsal.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const locationsData = XLSX.utils.sheet_to_json(worksheet);

    await salarySmodel.insertMany(locationsData);
    res.status(201).json({ message: 'Locations imported successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




