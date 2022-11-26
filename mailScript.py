from csv import writer
import os
import time

path_of_the_directory = "/Users/raymundo.ledezma/Desktop/MLOPS bootCamp/maildir/whitt-m"
# path_of_the_directory = "/Users/raymundo.ledezma/Desktop/MLOPS bootCamp/maildir"



print("starting")
start = time.time()

with open('emailsData.csv', 'a') as f_object:

    writer_object = writer(f_object)
 
    for root, dirs, files in os.walk(path_of_the_directory):
        for file in files:
            filePath = root.replace("Users/raymundo.ledezma/Desktop/MLOPS bootCamp/maildir/", "") + file
            f =  open(os.path.join(root, file))
            read = f.read()
            writer_object.writerow([filePath,read])
            f.close()
    end = time.time()
    print("Done in " , end - start)