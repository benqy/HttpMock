7z.exe a -tzip bin\app.nw ..\app\*
copy /b ..\nw.exe+bin\app.nw bin\app.exe
copy ..\nw.pak bin\nw.pak
copy ..\icudt.dll bin\icudt.dll
del	bin\app.nw