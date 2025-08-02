-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 02, 2025 at 10:46 PM
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
-- Struktura tabeli dla tabeli `authors`
--

CREATE TABLE `authors` (
  `id` int(11) NOT NULL,
  `birth` text NOT NULL,
  `death` text NOT NULL,
  `description` text NOT NULL,
  `photo` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authors`
--

INSERT INTO `authors` (`id`, `birth`, `death`, `description`, `photo`) VALUES
(8, '997', '999', 'asdasdasd', '97d5de06b8b640785c67cf4ce5e4d0a71750451850560.jpg'),
(9, '', '', '', '');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `authors_aliases`
--

CREATE TABLE `authors_aliases` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `author` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authors_aliases`
--

INSERT INTO `authors_aliases` (`id`, `name`, `author`) VALUES
(5, 'George Orwell', 9),
(16, 'Honore de Balzac', 8),
(17, 'Honoré de Balzac', 8);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `banned`
--

CREATE TABLE `banned` (
  `id` int(11) NOT NULL,
  `email` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banned`
--

INSERT INTO `banned` (`id`, `email`) VALUES
(1, 'asdqwe@asdd.pl'),
(2, 'asdasd@ASD.PL');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `tytul` text NOT NULL,
  `autor` text NOT NULL,
  `rok` text NOT NULL,
  `strony` int(11) NOT NULL,
  `opis` text NOT NULL,
  `tagi` text NOT NULL,
  `okladka` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `tytul`, `autor`, `rok`, `strony`, `opis`, `tagi`, `okladka`) VALUES
(1, 'Lost Illusions', 'Honoré de Balzac', '1837', 623, 'Handsome would-be poet Lucien Chardon is poor and naive, but highly ambitious. Failing to make his name in his dull provincial hometown, he is taken up by a patroness, the captivating married woman Madame de Bargeton, and prepares to forge his way in the glamorous beau monde of Paris. But Lucien has entered a world far more dangerous than he realized, as Madame de Bargeton\'s reputation becomes compromised and the fickle, venomous denizens of the courts and salons conspire to keep him out of their ranks. Lucien eventually learns that, wherever he goes, talent counts for nothing in comparison to money, intrigue and unscrupulousness. Lost Illusions is one of the greatest novels in the rich procession of the Comedie humaine, Balzac\'s panoramic social and moral history of his times.', '[\"classics\"]', 'lost_illusions.png'),
(2, 'Gone with the Wind', 'Margaret Mitchell', '1936', 1056, 'Scarlett O\'Hara, the beautiful, spoiled daughter of a well-to-do Georgia plantation owner, must use every means at her disposal to claw her way out of the poverty she finds herself in after Sherman\'s March to the Sea.', '[\"classics\"]', '15cef3ae08914354ad9e5d9b9e55515e1730672127814.png'),
(3, 'Crime and Punishment', 'Fyodor Dostoevsky', '1866', 671, 'Raskolnikov, a destitute and desperate former student, wanders through the slums of St Petersburg and commits a random murder without remorse or regret. He imagines himself to be a great man, a Napoleon: acting for a higher purpose beyond conventional moral law. But as he embarks on a dangerous game of cat and mouse with a suspicious police investigator, Raskolnikov is pursued by the growing voice of his conscience and finds the noose of his own guilt tightening around his neck. Only Sonya, a downtrodden sex worker, can offer the chance of redemption.', '[\"classics\"]', 'crime_and_punishment.png'),
(4, 'The Metamorphosis', 'Franz Kafka', '1915', 201, 'It is the story of a young man who, transformed overnight into a giant beetle-like insect, becomes an object of disgrace to his family, an outsider in his own home, a quintessentially alienated man. A harrowing—though absurdly comic—meditation on human feelings of inadequacy, guilt, and isolation, The Metamorphosis has taken its place as one of the most widely read and influential works of twentieth-century fiction. As W.H. Auden wrote, \"Kafka is important to us because his predicament is the predicament of modern man.\"', '[\"classics\"]', 'metamorphosis.png'),
(5, '1984', 'George Orwell', '1949', 368, 'A masterpiece of rebellion and imprisonment where war is peace freedom is slavery and Big Brother is watching. Thought Police, Big Brother, Orwellian - these words have entered our vocabulary because of George Orwell\'s classic dystopian novel 1984. The story of one man\'s Nightmare Odyssey as he pursues a forbidden love affair through a world ruled by warring states and a power structure that controls not only information but also individual thought and memory 1984 is a prophetic haunting tale More relevant than ever before 1984 exposes the worst crimes imaginable the destruction of truth freedom and individuality.', '[\"classics\"]', '1984.png'),
(6, 'Animal Farm', 'George Orwell', '1945', 141, 'A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice, and equality. Thus the stage is set for one of the most telling satiric fables ever penned –a razor-edged fairy tale for grown-ups that records the evolution from revolution against tyranny to a totalitarianism just as terrible.\r\nWhen Animal Farm was first published, Stalinist Russia was seen as its target. Today it is devastatingly clear that wherever and whenever freedom is attacked, under whatever banner, the cutting clarity and savage comedy of George Orwell’s masterpiece have a meaning and message still ferociously fresh.', '[\"classics\"]', 'animal_farm.png'),
(11, 'Eugenia Grandet', 'Honore de Balzac', '2123', 123123, 'asdasdasd', '[]', ''),
(12, 'Father Goriot', 'Honore de Balzac', '123', 123, '', '[]', '');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `collections`
--

CREATE TABLE `collections` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `name` text NOT NULL,
  `books` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`books`)),
  `description` text NOT NULL,
  `private` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collections`
--

INSERT INTO `collections` (`id`, `user`, `name`, `books`, `description`, `private`) VALUES
(6, 'asd', 'asdasd', '[{\"id\":1},{\"id\":4},{\"id\":6},{\"id\":5},{\"id\":2}]', '', 0),
(10, 'asd', 'erree', '[{\"id\":6},{\"id\":2},{\"id\":1},{\"id\":5}]', 'asdasdasdasd', 0),
(14, 'asde', 'Orwell', '[{\"id\":6},{\"id\":5}]', 'ksiązki orwella. duh', 0),
(15, 'asde', 'asdasd', '[{\"id\":1},{\"id\":4},{\"id\":3},{\"id\":5},{\"id\":2}]', '', 0),
(16, 'asdfghjkl', 'asdasd', '[{\"id\":5}]', 'adsdas', 0),
(17, 'asdfghjkl', 'Balzac', '[{\"id\":1}]', '', 0),
(20, 'asdfghjkl', 'private', '[{\"id\":6}]', '', 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `review` int(11) DEFAULT NULL,
  `collection` int(11) DEFAULT NULL,
  `quote` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `user`, `review`, `collection`, `quote`) VALUES
(50, 'asd', NULL, 6, NULL),
(67, 'asdfghjkl', NULL, NULL, 19),
(84, 'qwertyuiop', 37, NULL, NULL),
(85, 'qwertyuiop', NULL, 16, NULL),
(111, 'asdfghjkl', NULL, NULL, 18),
(112, 'asdfghjkl', NULL, 16, NULL),
(124, 'asdfghjkl', 37, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `new_authors`
--

CREATE TABLE `new_authors` (
  `id` int(11) NOT NULL,
  `birth` text NOT NULL,
  `death` text NOT NULL,
  `description` text NOT NULL,
  `photo` text NOT NULL,
  `user` varchar(50) NOT NULL,
  `submit_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `names` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `new_authors`
--

INSERT INTO `new_authors` (`id`, `birth`, `death`, `description`, `photo`, `user`, `submit_date`, `names`) VALUES
(27, '', '', '', '', 'asdfghjkl', '2025-06-20 17:50:00', 'Margaret Mitchell');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `new_books`
--

CREATE TABLE `new_books` (
  `id` int(11) NOT NULL,
  `tytul` text NOT NULL,
  `autor` text NOT NULL,
  `rok` text NOT NULL,
  `strony` int(11) NOT NULL,
  `opis` text NOT NULL,
  `tagi` text NOT NULL,
  `okladka` text NOT NULL,
  `user` varchar(50) NOT NULL,
  `submit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `new_books`
--

INSERT INTO `new_books` (`id`, `tytul`, `autor`, `rok`, `strony`, `opis`, `tagi`, `okladka`, `user`, `submit_date`) VALUES
(27, 'asd', 'asd', 'asd', 12, '', '[\"horror\"]', '', 'asd', '2024-11-02 19:17:21'),
(28, 'asdasd', 'asdasd', 'asd', 12, '', '[]', '', 'asd', '2024-11-02 19:17:26'),
(29, 'asdasd', 'asd', 'asd', 12, '', '[]', '', 'asd', '2024-11-02 19:17:39'),
(30, 'asdasd', 'asd', '12', 12, '', '[]', '', 'asd', '2024-11-02 19:17:45'),
(31, 'asd', 'asdasd', '12', 12, '', '[]', '', 'asd', '2024-11-02 19:17:50'),
(32, 'adssad', 'asd', 'asd', 12, '', '[]', '', 'asd', '2024-11-02 19:17:56'),
(33, 'asdasd', 'asd', '1', 12, '', '[]', '', 'asd', '2024-11-02 19:31:59'),
(34, 'asd', 'asd', 'asd', 12, '', '[]', '', 'asd', '2024-11-02 19:32:05'),
(36, 'asdasd', 'asdasd', 'asd', 12, '', '[]', '9d7b6d5a4b5fecf7e0d94028e79988041730668287010.webp', 'asd', '2024-11-03 21:11:27'),
(37, 'asdasd', 'asd', '123123', 123, 'sadad', '[\"classics\"]', '', 'asdfghjkl', '2025-06-05 10:57:28'),
(38, 'asd', 'asd', 'asd', 12323, '', '[]', '0ffd533dd127c9876d39a3ce9c108e661750357031653.png', 'asdfghjkl', '2025-06-19 18:17:11');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` text NOT NULL,
  `text` text NOT NULL,
  `user` varchar(50) NOT NULL,
  `quote` int(11) DEFAULT NULL,
  `review` int(11) DEFAULT NULL,
  `collection` int(11) DEFAULT NULL,
  `like_from` varchar(50) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `seen` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `title` text NOT NULL,
  `text` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `thumbnail` text NOT NULL,
  `user` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `text`, `date`, `thumbnail`, `user`) VALUES
(2, 'asd', '<p>asd</p><p><img src=\"../../public/uploads/blog/postimg_1754167195532_0.jpg\"></p>', '2025-08-02 20:39:55', '', 'asdfghjkl');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `quotes`
--

CREATE TABLE `quotes` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `book` int(11) NOT NULL,
  `text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotes`
--

INSERT INTO `quotes` (`id`, `user`, `book`, `text`) VALUES
(2, 'qweqwe', 1, 'asdasd'),
(5, 'qweqwe', 1, 'asdasd'),
(6, 'qweqwe', 1, 'asdasd'),
(7, 'qweqwe', 1, 'mnmnmn'),
(8, 'qweqwe', 1, 'asdasd'),
(9, 'qweqwe', 1, 'ghghghgh'),
(10, 'qweqwe', 1, 'asdasd'),
(11, 'qweqwe', 1, 'ererererer'),
(12, 'qweqwe', 1, 'asdasd'),
(13, 'qweqwe', 1, 'gfhdufa'),
(14, 'qweqwe', 1, 'asdasd'),
(15, 'qweqwe', 1, 'xcxcxcxc'),
(16, 'qweqwe', 1, 'asdasd'),
(17, 'qweqwe', 1, 'vbbvvb'),
(18, 'asdfghjkl', 1, 'popopopo'),
(19, 'asdfghjkl', 5, 'qweqweqweqwe');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `book` int(11) NOT NULL,
  `rating` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user`, `book`, `rating`) VALUES
(7, 'asd', 1, 10),
(8, 'asd', 2, 10),
(9, 'asd', 4, 7),
(10, 'asd', 6, 9),
(11, 'asd', 5, 10),
(12, 'asdfghjkl', 5, 9),
(13, 'asdfghjkl', 1, 3),
(14, 'qwertyuiop', 5, 9),
(15, 'asdfghjkl', 11, 3);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_reporting` varchar(50) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `review` int(11) DEFAULT NULL,
  `quote` int(11) DEFAULT NULL,
  `user` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_reporting`, `date`, `review`, `quote`, `user`) VALUES
(12, 'asdfghjkl', '2025-06-07 11:36:57', NULL, 2, NULL),
(13, 'asdfghjkl', '2025-06-07 14:31:10', NULL, NULL, 'asdfghjkl'),
(14, NULL, '2025-07-31 17:48:43', 37, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `book` int(11) NOT NULL,
  `text` text NOT NULL,
  `spoiler` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user`, `book`, `text`, `spoiler`) VALUES
(18, 'asd', 1, 'asdasdasdas', 0),
(22, 'qwerty', 1, 'asdasd', 0),
(23, 'qweqwe', 1, 'asdasdads', 0),
(24, 'asdqweqwe', 1, 'asdasdasdasd', 0),
(25, 'asdqweqwe', 1, 'asdasdasd', 0),
(26, 'asdqweqwe', 1, 'asdasdsad', 0),
(27, 'qweqwe', 1, 'asdasdsadasd', 0),
(28, 'qwerty', 1, 'asdasdasdasd', 0),
(29, 'qwerty', 1, 'asdasdasd', 0),
(37, 'asdfghjkl', 1, 'asdasdasdsad', 0);

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
('C854lcEgscVY10kRORz0IECDJfj0bJgE', '{\"cookie\":{\"originalMaxAge\":172800000,\"expires\":\"2025-08-04T12:19:19.216Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":\"asdfghjkl\"}', 1754309959);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`tags`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `tags`) VALUES
(1, '[\"classics\",\"horror\",\"thriller\",\"sci-fi\",\"fantasy\",\"poetry\",\"play\",\"comedy\",\"tragedy\"]');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `login` varchar(50) NOT NULL,
  `haslo` text NOT NULL,
  `email` text NOT NULL,
  `prof` text NOT NULL,
  `admin` tinyint(1) NOT NULL,
  `private` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`login`, `haslo`, `email`, `prof`, `admin`, `private`) VALUES
('asd', '$2a$10$.6Zg8omFEdIqD.ySEyqeQ.T91jaLJqjAbezBw18konuODn9jhMm8G', 'szymkiewiczmateusz1@gmail.com', '5a4b2af2489d115707bca8ef8875444c1729932155803.webp', 1, 0),
('asdasd123', '$2a$10$dkX97ELCaPX10e/Nz8qMR.G.BJT1p5CuYPmMNmCPB.egHc/dOE05u', 'asd46asd@sddsf.pl', '', 0, 0),
('asdasd12e', '$2a$10$H6.Dwy7jXjV14s4IeuTi0.rAPpV9yFEuWejjPJza0C/muASqlSw96', 'asdqwe@asasddd.pl', '', 0, 0),
('asde', '$2a$10$m/utAoIDf7knKdE9TJoNPu/n3MSg2fOkcSgN4Xdd2MPCatXE2tSH6', 'sadasdasd@asd.pl', '', 0, 0),
('asdfghjkl', '$2a$10$6hwqsEpZK9dA3IGY55.o0OrARw8K9B9xKqZ4pJ7bpoWG5mRdsvzDG', 'asdsad@asdsad.pl', '', 1, 0),
('asdqweqwe', '$2a$10$7LBAKgpq.pI73Ij6zqRCfOA49lALT8RpsayEQw0/6atacWY.Pi4Ny', 'asdasd@W.asdpl', '', 0, 0),
('qweqwe', '$2a$10$PYeYpkTfP9CGPIW47IF/.OxYlDUW0UQ/V4GhpSDjFetkqcQfW2vtO', 'asdasd@sddsf.pl', '', 0, 0),
('qwerty', '$2a$10$JJX554Kbq5KenfL9sZoRwO9pf3egIxPQbS/rwX1.TWRSwQJ0irEJu', 'adasd@assdas.pl', '', 0, 0),
('qwertyuiop', '$2a$10$Gz3EIkl1L0uUjBMcFCyD9e/JusVN4RAykjh74f35OGzsOGMhHBl96', 'qwertyuiop@sd.pl', '', 0, 0);

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `authors_aliases`
--
ALTER TABLE `authors_aliases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author` (`author`);

--
-- Indeksy dla tabeli `banned`
--
ALTER TABLE `banned`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `collections`
--
ALTER TABLE `collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

--
-- Indeksy dla tabeli `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `collection` (`collection`),
  ADD KEY `review` (`review`),
  ADD KEY `user` (`user`) USING BTREE,
  ADD KEY `quote` (`quote`);

--
-- Indeksy dla tabeli `new_authors`
--
ALTER TABLE `new_authors`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `new_books`
--
ALTER TABLE `new_books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

--
-- Indeksy dla tabeli `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `quote` (`quote`),
  ADD KEY `review` (`review`),
  ADD KEY `collection` (`collection`),
  ADD KEY `like_from` (`like_from`);

--
-- Indeksy dla tabeli `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

--
-- Indeksy dla tabeli `quotes`
--
ALTER TABLE `quotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `book` (`book`);

--
-- Indeksy dla tabeli `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `book` (`book`);

--
-- Indeksy dla tabeli `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_reporting` (`user_reporting`),
  ADD KEY `user` (`user`),
  ADD KEY `quote` (`quote`),
  ADD KEY `review` (`review`);

--
-- Indeksy dla tabeli `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `book` (`book`);

--
-- Indeksy dla tabeli `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`sid`);

--
-- Indeksy dla tabeli `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`login`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `authors_aliases`
--
ALTER TABLE `authors_aliases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `banned`
--
ALTER TABLE `banned`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT for table `new_authors`
--
ALTER TABLE `new_authors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `new_books`
--
ALTER TABLE `new_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quotes`
--
ALTER TABLE `quotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `authors_aliases`
--
ALTER TABLE `authors_aliases`
  ADD CONSTRAINT `authors_aliases_ibfk_1` FOREIGN KEY (`author`) REFERENCES `authors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `collections`
--
ALTER TABLE `collections`
  ADD CONSTRAINT `collections_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`collection`) REFERENCES `collections` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`review`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `likes_ibfk_3` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `likes_ibfk_4` FOREIGN KEY (`quote`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `new_books`
--
ALTER TABLE `new_books`
  ADD CONSTRAINT `new_books_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`review`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`collection`) REFERENCES `collections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`like_from`) REFERENCES `users` (`login`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_5` FOREIGN KEY (`quote`) REFERENCES `quotes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE SET NULL;

--
-- Constraints for table `quotes`
--
ALTER TABLE `quotes`
  ADD CONSTRAINT `quotes_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotes_ibfk_2` FOREIGN KEY (`book`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`book`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`quote`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`review`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_4` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_5` FOREIGN KEY (`user_reporting`) REFERENCES `users` (`login`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`book`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
