Flow of Data Migration
1. Use BulZip tool to convert MDB to sql (All Data)
2. Upload it to PHP My Admin DB
3. Export car, instructor, job, accounts, carfuel, job5, 6, 7 details, learnlicdet, permanentlicdet, stufees into CSV
4. Run below query and export it into CSV
    CREATE TABLE yash_students AS
    SELECT 
        stud.StuID,
        stud.StuPhone,
        stud.StuName,
        stud.StuDOB,
        stud.StuDOI,
        stud.StuSDWOf,
        stud.CarID,
        stud.InstID,
        stud.StuPerAdd,
        ll.LicNo   AS learn_lic_no,
        ll.LicType AS learn_lic_type,
        ll.DtIssue AS learn_dt_issue,
        ll.DtExpire AS learn_dt_expiry,
        dl.LicNo   AS perm_lic_no,
        dl.LicType AS perm_lic_type,
        dl.DtIssue AS perm_dt_issue,
        dl.DtExpire AS perm_dt_expiry,
        stud.JobID,
        dl.Endorse,
        dl.EndorseDate,
        stud.LastUpdatedDate
    FROM mst_student stud
    LEFT JOIN tbl_learnlicdet ll 
        ON stud.StuID = ll.StuID
    LEFT JOIN tbl_permanentlicdet dl 
        ON stud.StuID = dl.StuID;

5. Use Schema Structure to populate data
6. Use BulZip tool to convert MDB to sql (Only Images)
7. Use this flow to populate using ipynb = car, instructor, student, image, fuel, work, jobs, payment