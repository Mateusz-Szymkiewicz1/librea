-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Paź 06, 2024 at 03:08 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `librea`
--
CREATE DATABASE IF NOT EXISTS `librea` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `librea`;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `tytul` text NOT NULL,
  `autor` text NOT NULL,
  `rok` int(4) NOT NULL,
  `strony` int(11) NOT NULL,
  `opis` text NOT NULL,
  `tagi` text NOT NULL,
  `okladka` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `tytul`, `autor`, `rok`, `strony`, `opis`, `tagi`, `okladka`) VALUES
(1, 'Lost Illusions', 'Honoré de Balzac', 1837, 623, 'Handsome would-be poet Lucien Chardon is poor and naive, but highly ambitious. Failing to make his name in his dull provincial hometown, he is taken up by a patroness, the captivating married woman Madame de Bargeton, and prepares to forge his way in the glamorous beau monde of Paris. But Lucien has entered a world far more dangerous than he realized, as Madame de Bargeton\'s reputation becomes compromised and the fickle, venomous denizens of the courts and salons conspire to keep him out of their ranks. Lucien eventually learns that, wherever he goes, talent counts for nothing in comparison to money, intrigue and unscrupulousness. Lost Illusions is one of the greatest novels in the rich procession of the Comedie humaine, Balzac\'s panoramic social and moral history of his times.', '[\"classics\"]', 'lost_illusions.png');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `collections`
--

CREATE TABLE `collections` (
  `id` int(11) NOT NULL,
  `user` text NOT NULL,
  `books` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`books`)),
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `user` text NOT NULL,
  `review` int(11) NOT NULL DEFAULT 0,
  `collection` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user` text NOT NULL,
  `book` int(11) NOT NULL,
  `rating` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user`, `book`, `rating`) VALUES
(6, 'asd', 1, 6);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user` text NOT NULL,
  `book` int(11) NOT NULL,
  `text` text NOT NULL,
  `spoiler` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user`, `book`, `text`, `spoiler`) VALUES
(1, 'asd', 1, 'asdsvcxvcxv asd asdsvcxvcxv asd asdsvcxvcxv asd asdsvcxvcxv asdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxv asdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvsdasdsvcxvcxvasdasdsvcxvcxvdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxasdasdsvcxvcxvasdasdsvcxvcxvasdasdsvcxvcxv asd', 0),
(2, 'asd', 1, 'asdasdasdsad', 0),
(3, 'asd', 1, 'asdasdasdsad', 0),
(4, 'asd', 1, 'asdasdasd', 1),
(5, 'asd', 1, 'asdasdasd', 1),
(6, 'fddf', 1, 'asdasdsa', 0);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `sessions`
--

CREATE TABLE `sessions` (
  `sid` varchar(255) NOT NULL,
  `session` text NOT NULL,
  `expires` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`sid`, `session`, `expires`) VALUES
('gPoS03lZ1loMp6hDZYTQYHoltYvlsbD9', '{\"cookie\":{\"originalMaxAge\":172800000,\"expires\":\"2024-10-07T18:15:54.504Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":\"asd\"}', 1728324955),
('NoZOwaiz76DmjsUECxroNIKOpLfdA5fz', '{\"cookie\":{\"originalMaxAge\":172800000,\"expires\":\"2024-10-07T10:00:25.416Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":\"asd\"}', 1728295225),
('Vn6uvJQJAEnLm5ayBee_hg1AuHDClTnb', '{\"cookie\":{\"originalMaxAge\":172800000,\"expires\":\"2024-10-07T10:01:32.338Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":\"asd\"}', 1728295292);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `login` text NOT NULL,
  `haslo` text NOT NULL,
  `email` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`, `haslo`, `email`) VALUES
(1, 'asd', '$2a$10$o/eaYXmszOAk8F3oHXRzNeZaGzH0atmFpG.PRmq7vuSSxWr3Xowam', 'szymkiewiczmateusz1@gmail.com');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
