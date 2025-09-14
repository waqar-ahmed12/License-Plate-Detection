const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ocr_envPath = path.join(__dirname, '..', '..', 'ocr_env')
function runPython(pythonPath, scriptPath, args = [])  // function to run a python script from node 
{
  return new Promise((resolve, reject) => {
    const process = spawn(pythonPath, [scriptPath, ...args]);

    let stdout = ""
    let stderr = ""

    process.stdout.on("data", (data) => 
    {
      const text = data.toString()
      stdout += text
      console.log(`[${path.basename(scriptPath)} stdout]: ${text.trim()}`)
    })

    process.stderr.on("data", (data) => 
    {
      const text = data.toString() 
      stderr += text;
      console.error(`[${path.basename(scriptPath)} stderr]: ${text.trim()}`);
    });

    process.on("close", (code) => {
      console.log(`[${path.basename(scriptPath)}] exited with code ${code}`);
      if (code === 0) 
        resolve(stdout.trim());
      else
        reject(new Error(stderr || stdout || `Process exited with code ${code}`));
    });
  });
}


function convertToH264(inputPath, outputPath) 
{
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",              
      "-i", inputPath,   
      "-c:v", "libx264", 
      "-preset", "fast", 
      "-crf", "23",      
      "-c:a", "aac",     
      outputPath
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg failed with code ${code}`));
    });
  });
}


async function predictVideo(req, res)
{
  try 
  {
    const pythonPath = path.join(ocr_envPath, "bin/python");
    const scriptPath = path.join(ocr_envPath, "modifiedMain.py");
    const missingValsScript = path.join(ocr_envPath, "addMissingData.py");
    const visualizeScript = path.join(ocr_envPath, "visualize.py");

    const uploadedPath = req.file.path;
    const fileName = path.basename(uploadedPath, path.extname(uploadedPath));

    const interpolatedPath = path.join(
      ocr_envPath,
      "interpolated",
      `${fileName}.csv`
    );
    const mp4Path = path.join(ocr_envPath, "interpolated", `${fileName}.mp4`);

    const modifiedMp4 = path.join(  // some file structure
        ocr_envPath,
        "interpolated",
        `${fileName}_h264.mp4`
      );

    // Step 0: If interpolated CSV already exists     fs.existsSync(interpolatedPath) && 
    if (fs.existsSync(mp4Path) || fs.existsSync(modifiedMp4)) // meaning if there is a csv and the mp4
    {
      console.log("Found existing result, skipping processing");      

      // only convert if not already converted
      if (!fs.existsSync(modifiedMp4)) 
      {
        console.log("Converting existing mp4 to H.264...");
        await convertToH264(mp4Path, modifiedMp4);
      }

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", "inline");
      return fs.createReadStream(modifiedMp4).pipe(res);
    }


    // 1. Run modifiedMain.py
    console.log("Running modifiedMain.py...");
    await runPython(pythonPath, scriptPath, [uploadedPath]);

    // 2. Run addMissingData.py
    console.log("Running addMissingData.py...");
    const csvPath = path.join(ocr_envPath, "csv folder", `${fileName}.csv`);
    await runPython(pythonPath, missingValsScript, [csvPath]);

    
    // 3. Run visualize.py
    console.log("Running visualize.py...");
    await runPython(pythonPath, visualizeScript, [interpolatedPath]);

    // 4. Convert raw mp4 to H.264 encoded mp4
    const ffmpeg = require("child_process").spawnSync;
    const rawMp4 = path.join(
      ocr_envPath,
      "interpolated",
      `${fileName}.mp4`
    );


    console.log("Converting to H.264...");
    ffmpeg("ffmpeg", [
      "-y",           
      "-i", rawMp4,   
      "-c:v", "libx264", 
      "-preset", "fast",
      "-crf", "23",
      modifiedMp4
    ]);

    // 5. Send MP4 result
    if (fs.existsSync(modifiedMp4)) 
    {
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", "inline");
      const stream = fs.createReadStream(modifiedMp4);
      stream.pipe(res);
    } 
    else 
      res.status(500).send("Error: Encoded video not found")

  }
  catch (err) 
  {
    res.status(500).json({ error: "Pipeline failed", details: err.message });
  }
}


function getCsv(req, res) 
{
  const { fileName } = req.params;

  const csvPath = path.join(
    ocr_envPath,
    "interpolated",
    `${fileName}_unique.csv`
  );


  if (fs.existsSync(csvPath)) 
  {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.csv"`
    );
    const stream = fs.createReadStream(csvPath);
    stream.pipe(res);
  } else {
    res.status(404).send("CSV not found");
  }
};

module.exports = { predictVideo, getCsv }