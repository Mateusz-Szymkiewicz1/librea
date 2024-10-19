-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Paź 19, 2024 at 07:54 PM
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
DROP DATABASE IF EXISTS `librea`;
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
(1, 'Lost Illusions', 'Honoré de Balzac', 1837, 623, 'Handsome would-be poet Lucien Chardon is poor and naive, but highly ambitious. Failing to make his name in his dull provincial hometown, he is taken up by a patroness, the captivating married woman Madame de Bargeton, and prepares to forge his way in the glamorous beau monde of Paris. But Lucien has entered a world far more dangerous than he realized, as Madame de Bargeton\'s reputation becomes compromised and the fickle, venomous denizens of the courts and salons conspire to keep him out of their ranks. Lucien eventually learns that, wherever he goes, talent counts for nothing in comparison to money, intrigue and unscrupulousness. Lost Illusions is one of the greatest novels in the rich procession of the Comedie humaine, Balzac\'s panoramic social and moral history of his times.', '[\"classics\"]', 'lost_illusions.png'),
(2, 'Gone with the Wind', 'Margaret Mitchell', 1936, 1056, 'Scarlett O\'Hara, the beautiful, spoiled daughter of a well-to-do Georgia plantation owner, must use every means at her disposal to claw her way out of the poverty she finds herself in after Sherman\'s March to the Sea.', '[\"classics\"]', 'gone_with_the_wind.png'),
(3, 'Crime and Punishment', 'Fyodor Dostoevsky', 1866, 671, 'Raskolnikov, a destitute and desperate former student, wanders through the slums of St Petersburg and commits a random murder without remorse or regret. He imagines himself to be a great man, a Napoleon: acting for a higher purpose beyond conventional moral law. But as he embarks on a dangerous game of cat and mouse with a suspicious police investigator, Raskolnikov is pursued by the growing voice of his conscience and finds the noose of his own guilt tightening around his neck. Only Sonya, a downtrodden sex worker, can offer the chance of redemption.', '[\"classics\"]', 'crime_and_punishment.png'),
(4, 'The Metamorphosis', 'Franz Kafka', 1915, 201, 'It is the story of a young man who, transformed overnight into a giant beetle-like insect, becomes an object of disgrace to his family, an outsider in his own home, a quintessentially alienated man. A harrowing—though absurdly comic—meditation on human feelings of inadequacy, guilt, and isolation, The Metamorphosis has taken its place as one of the most widely read and influential works of twentieth-century fiction. As W.H. Auden wrote, \"Kafka is important to us because his predicament is the predicament of modern man.\"', '[\"classics\"]', 'metamorphosis.png'),
(5, '1984', 'George Orwell', 1949, 368, 'A masterpiece of rebellion and imprisonment where war is peace freedom is slavery and Big Brother is watching. Thought Police, Big Brother, Orwellian - these words have entered our vocabulary because of George Orwell\'s classic dystopian novel 1984. The story of one man\'s Nightmare Odyssey as he pursues a forbidden love affair through a world ruled by warring states and a power structure that controls not only information but also individual thought and memory 1984 is a prophetic haunting tale More relevant than ever before 1984 exposes the worst crimes imaginable the destruction of truth freedom and individuality.', '[\"classics\"]', '1984.png'),
(6, 'Animal Farm', 'George Orwell', 1945, 141, 'A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice, and equality. Thus the stage is set for one of the most telling satiric fables ever penned –a razor-edged fairy tale for grown-ups that records the evolution from revolution against tyranny to a totalitarianism just as terrible.\r\nWhen Animal Farm was first published, Stalinist Russia was seen as its target. Today it is devastatingly clear that wherever and whenever freedom is attacked, under whatever banner, the cutting clarity and savage comedy of George Orwell’s masterpiece have a meaning and message still ferociously fresh.', '[\"classics\"]', 'animal_farm.png');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `collections`
--

CREATE TABLE `collections` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `name` text NOT NULL,
  `books` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`books`)),
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collections`
--

INSERT INTO `collections` (`id`, `user`, `name`, `books`, `description`) VALUES
(6, 'asd', 'asdasd', '[{\"id\":2},{\"id\":1},{\"id\":4},{\"id\":3},{\"id\":6},{\"id\":5}]', ''),
(10, 'asd', 'erree', '[{\"id\":6},{\"id\":2}]', 'asdasdasdasd');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `review` int(11) DEFAULT NULL,
  `collection` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `user`, `review`, `collection`) VALUES
(42, 'asd', NULL, 6);

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
(7, 'asd', 1, 10);

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
(13, 'asd', 1, 'cvbvcc', 1);

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
('iGGIpBRpzl9xPCu9q1-7ak6vE-A-KKk5', '{\"cookie\":{\"originalMaxAge\":172800000,\"expires\":\"2024-10-21T15:17:59.352Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":\"asd\"}', 1729523879),
('w55GXoOa4T_oNIQ8egf2xMBlZZSkdq74', '{\"cookie\":{\"originalMaxAge\":172800000,\"expires\":\"2024-10-21T14:00:24.186Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":\"asd\"}', 1729519224);

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
  `prof` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`login`, `haslo`, `email`, `prof`) VALUES
('asd', '$2a$10$.6Zg8omFEdIqD.ySEyqeQ.T91jaLJqjAbezBw18konuODn9jhMm8G', 'szymkiewiczmateusz1@gmail.com', '2230153dddfd1a96406dd811678dc5e01729196066059.jpg');

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

--
-- Indeksy dla tabeli `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `collection` (`collection`),
  ADD KEY `review` (`review`),
  ADD KEY `user` (`user`) USING BTREE;

--
-- Indeksy dla tabeli `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `book` (`book`);

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
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `collections`
--
ALTER TABLE `collections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `likes_ibfk_3` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`login`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`book`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
