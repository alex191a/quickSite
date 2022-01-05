-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Vært: jbgaard.xyz:3306
-- Genereringstid: 05. 01 2022 kl. 11:01:47
-- Serverversion: 8.0.27
-- PHP-version: 7.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quicksite`
--

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Site-Info`
--

CREATE TABLE `Site-Info` (
  `id` int NOT NULL,
  `site_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_mail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_phone` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `text` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Sites`
--

CREATE TABLE `Sites` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `skabelon_id` int NOT NULL,
  `contact_mail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_phone` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `text` text COLLATE utf8_unicode_ci NOT NULL,
  `sub_domain` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `favicon` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

--
-- Data dump for tabellen `Sites`
--

INSERT INTO `Sites` (`id`, `name`, `user_id`, `skabelon_id`, `contact_mail`, `contact_phone`, `contact_address`, `contact_name`, `text`, `sub_domain`, `favicon`) VALUES
(45, 'Alex', 28, 3, 'hej@g', '27573435', 'viborggade', 'alex', 'arrrrrrrrrrrrrrrrrrrrrrrrrrriba', 'alex', '/public/Sites/tater2/runeklan-haabefuld.png'),
(47, 'sut mig', 30, 4, 'porno@porhub.com', '12345678', 'asdfghjkl', 'qghj', 'zsdxfcgvhbjnkml,', 's/ged', '/public/Sites/tater2/runeklan-haabefuld.png'),
(48, 'dxfcgvhbjklæ', 30, 4, 'fgchvjbknlm@cfyghijk.com', '234567', 'gfchvjbn', 'dgvhbnm', 'fhjbknm', 'gfchvjbnkm', '/public/Sites/tater2/runeklan-haabefuld.png'),
(49, 'Tina analsex', 29, 4, 'tina@anal.sex', '112', 'hehevej 8', 'Tina olsen', 'Mit navn er tina og jeg sælger min røvhul', 'tinaanal', '/public/Sites/tater2/runeklan-haabefuld.png'),
(51, 'Poul Hansen', 30, 4, 'poulhansen@ornitolog.fugle', '69696969', 'Det lokale bibliotek i 17 år', 'Poul Hansen', 'Be a hero be a man, kill a nigger join a clan', 'kend-din-fugl', '/public/Sites/tater2/runeklan-haabefuld.png'),
(59, 'Jonas', 27, 1, 'joan@joas.com', '123123123', 'Frijsenborgvej 128', 'Jonas', 'This is test.', 'tester123', '/public/Sites/tester123/download.jpeg'),
(60, 'Heste er seje', 33, 3, 'hest@hest.dk', '22222222', 'asfsaf', 'asfsaf', 'heste er seje', 'hest', '/public/Sites/hest/level 20.jpg'),
(61, 'Hejsa!', 27, 2, 'Minmail@mail.com', '2363191291', 'Min adresse 123, 6521 Årvang', 'Årvang Kontant', 'Hello guys!', 'arvang', '/public/Sites/arvang/4k-Nature-Wallpapers.jpg'),
(62, 'packard-bell', 34, 3, 'packard@gmail.com', '77341818', 'Omega 5, 8382 Hinnerup', 'Martin Østergaard', 'Hejsa, velkommen til Duka', 'duka', '/public/Sites/duka/richard-horvath-cPccYbPrF-A-unsplash.jpg');

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Skabeloner`
--

CREATE TABLE `Skabeloner` (
  `id` int NOT NULL,
  `placement` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `img_placement` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

--
-- Data dump for tabellen `Skabeloner`
--

INSERT INTO `Skabeloner` (`id`, `placement`, `name`, `img_placement`) VALUES
(1, 'skabelon1', 'Hvid / Sort', '/public/Skabeloner/skab1.png'),
(2, 'skabelon2', 'Gul / Sort', '/public/Skabeloner/skab2.png'),
(3, 'skabelon3', 'Grøn / Sort / Hvid', '/public/Skabeloner/skab3.png'),
(4, 'skabelon4', 'Sort / Rød', '/public/Skabeloner/skab4.png');

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Users`
--

CREATE TABLE `Users` (
  `id` int NOT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(512) COLLATE utf8_unicode_ci NOT NULL,
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;

--
-- Data dump for tabellen `Users`
--

INSERT INTO `Users` (`id`, `username`, `password`, `date_created`) VALUES
(27, 'jonas', '$2b$10$gdUIPKM84IqmQc9HQFpZU.b8GAbjG7VvZLmZv0AnxSa5ZoXt1ugBC', '2021-05-03 18:12:09'),
(28, 'tester', '$2b$10$mriqmBuJMWjKW8OVWLgYTePAF15LXBmccSJ3QwLpcb8Sn3w36L0qm', '2021-05-03 18:12:09'),
(29, 'Mercantec', '$2b$10$DxMA/59XNpJzAcluiday2O6buaAt8Xx1mAvp6L04zejsVp5ug2hN2', '2021-05-03 18:12:09'),
(30, 'kenned', '$2b$10$YNEvqY1f3meISs3G1zrPvu3ULkUWPM93YmJeY.gbbpi0HYL78OIpK', '2021-05-03 18:12:09'),
(33, 'hbo', '$2b$10$IHXtg1CNV1XR9u80Rlg5M.HWQZAU8W2qWBmR59sDCxWO.gLsWxPI6', '2021-05-11 10:19:18'),
(34, 'numsehat', '$2b$10$cDxY7IaTq4KZmtaxMoVv7.nhzF7G.UjIenMx6lK98jaSBRMBumXnS', '2021-11-16 23:39:24');

--
-- Begrænsninger for dumpede tabeller
--

--
-- Indeks for tabel `Site-Info`
--
ALTER TABLE `Site-Info`
  ADD PRIMARY KEY (`id`);

--
-- Indeks for tabel `Sites`
--
ALTER TABLE `Sites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sub_domain` (`sub_domain`);

--
-- Indeks for tabel `Skabeloner`
--
ALTER TABLE `Skabeloner`
  ADD PRIMARY KEY (`id`);

--
-- Indeks for tabel `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Brug ikke AUTO_INCREMENT for slettede tabeller
--

--
-- Tilføj AUTO_INCREMENT i tabel `Site-Info`
--
ALTER TABLE `Site-Info`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Tilføj AUTO_INCREMENT i tabel `Sites`
--
ALTER TABLE `Sites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- Tilføj AUTO_INCREMENT i tabel `Skabeloner`
--
ALTER TABLE `Skabeloner`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tilføj AUTO_INCREMENT i tabel `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
