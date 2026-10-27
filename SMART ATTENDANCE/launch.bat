@echo off
title Smart Attendance Management System (SAMS) - DBMS Mini Project
echo ==============================================================================
echo       SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS) - DBMS MINI PROJECT
echo ==============================================================================
echo.
echo [1/2] Opening Smart Attendance Admin Portal in your default web browser...
start "" "%~dp0index.html"
echo.
echo [2/2] Launching completed successfully!
echo.
echo ------------------------------------------------------------------------------
echo Admin Credentials:
echo   - SuperAdmin: admin@campus.edu  / Password: admin123
echo   - CSE Admin:  cse_admin@campus.edu / Password: admin123
echo   - Faculty:    ramesh.sharma@campus.edu / Password: faculty123
echo ------------------------------------------------------------------------------
echo Database SQL scripts located in:
echo   - Schema DDL:   database\schema.sql
echo   - Views/Triggers: database\views_triggers_procs.sql
echo   - Seed Data:    database\seed_data.sql
echo   - Top Queries:  database\sample_queries.sql
echo ------------------------------------------------------------------------------
pause
