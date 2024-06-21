-- Создание базы данных
CREATE DATABASE IF NOT EXISTS observatory;
USE observatory;

-- Создание таблицы Sector
CREATE TABLE IF NOT EXISTS Sector (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coordinates VARCHAR(100),
    light_intensity FLOAT,
    foreign_objects VARCHAR(255),
    star_objects_count INT,
    undefined_objects_count INT,
    defined_objects_count INT,
    notes TEXT
);

-- Создание таблицы Objects
CREATE TABLE IF NOT EXISTS Objects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50),
    accuracy FLOAT,
    count INT,
    time TIME,
    date DATE,
    notes TEXT,
    date_update TIMESTAMP NULL DEFAULT NULL
);

-- Создание таблицы NaturalObjects
CREATE TABLE IF NOT EXISTS NaturalObjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50),
    galaxy VARCHAR(100),
    accuracy FLOAT,
    light_flux FLOAT,
    associated_objects TEXT,
    notes TEXT
);

-- Создание таблицы Position
CREATE TABLE IF NOT EXISTS `Position` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    earth_position VARCHAR(100),
    sun_position VARCHAR(100),
    moon_position VARCHAR(100)
);

-- Создание таблицы Observation
CREATE TABLE IF NOT EXISTS Observation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sector_id INT,
    object_id INT,
    natural_object_id INT,
    position_id INT,
    FOREIGN KEY (sector_id) REFERENCES Sector(id),
    FOREIGN KEY (object_id) REFERENCES Objects(id),
    FOREIGN KEY (natural_object_id) REFERENCES NaturalObjects(id),
    FOREIGN KEY (position_id) REFERENCES `Position`(id)
);

-- Создание триггера для обновления даты
DELIMITER $$

CREATE TRIGGER update_date_trigger
BEFORE UPDATE ON Objects
FOR EACH ROW
BEGIN
    SET NEW.date_update = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- Создание процедуры для объединения таблиц
DELIMITER $$

CREATE PROCEDURE join_tables(IN table1 VARCHAR(64), IN table2 VARCHAR(64))
BEGIN
    SET @query = CONCAT('SELECT * FROM ', table1, ' t1 JOIN ', table2, ' t2 ON t1.id = t2.id');
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;

-- Вставка тестовых данных в таблицу Sector
INSERT INTO Sector (coordinates, light_intensity, foreign_objects, star_objects_count, undefined_objects_count, defined_objects_count, notes)
VALUES
('10,20', 1.5, 'none', 5, 2, 3, 'Test note 1'),
('30,40', 2.0, 'none', 6, 3, 3, 'Test note 2'),
('50,60', 2.5, 'none', 7, 4, 3, 'Test note 3'),
('70,80', 3.0, 'none', 8, 5, 3, 'Test note 4'),
('90,100', 3.5, 'none', 9, 6, 3, 'Test note 5');

-- Вставка тестовых данных в таблицу Objects
INSERT INTO Objects (type, accuracy, count, time, date, notes)
VALUES
('Star', 99.9, 1, '12:00:00', '2023-06-01', 'Star note 1'),
('Planet', 98.8, 2, '13:00:00', '2023-06-02', 'Planet note 2'),
('Galaxy', 97.7, 3, '14:00:00', '2023-06-03', 'Galaxy note 3'),
('Nebula', 96.6, 4, '15:00:00', '2023-06-04', 'Nebula note 4'),
('Comet', 95.5, 5, '16:00:00', '2023-06-05', 'Comet note 5');

-- Вставка тестовых данных в таблицу NaturalObjects
INSERT INTO NaturalObjects (type, galaxy, accuracy, light_flux, associated_objects, notes)
VALUES
('Star', 'Milky Way', 99.9, 1.5, 'none', 'Star note 1'),
('Planet', 'Andromeda', 98.8, 2.0, 'none', 'Planet note 2'),
('Galaxy', 'Triangulum', 97.7, 2.5, 'none', 'Galaxy note 3'),
('Nebula', 'Large Magellanic Cloud', 96.6, 3.0, 'none', 'Nebula note 4'),
('Comet', 'Small Magellanic Cloud', 95.5, 3.5, 'none', 'Comet note 5');

-- Вставка тестовых данных в таблицу Position
INSERT INTO `Position` (earth_position, sun_position, moon_position)
VALUES
('10,20', '30,40', '50,60'),
('20,30', '40,50', '60,70'),
('30,40', '50,60', '70,80'),
('40,50', '60,70', '80,90'),
('50,60', '70,80', '90,100');

-- Вставка тестовых данных в таблицу Observation
INSERT INTO Observation (sector_id, object_id, natural_object_id, position_id)
VALUES
(1, 1, 1, 1),
(2, 2, 2, 2),
(3, 3, 3, 3),
(4, 4, 4, 4),
(5, 5, 5, 5);
