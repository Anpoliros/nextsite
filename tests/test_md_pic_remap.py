import unittest

from scripts.md_pic_remap import ImagePathMatcher


class ImagePathMatcherTest(unittest.TestCase):
    def setUp(self):
        self.matcher = ImagePathMatcher()

    def add_image(self, path: str):
        self.matcher.add_image(path, f'/images/{path}')

    def test_matches_hyphen_reference_to_underscore_filename(self):
        self.add_image('re/firepunch/firepunch_1.JPG')

        self.assertEqual(
            self.matcher.find_best_match('firepunch-1'),
            're/firepunch/firepunch_1.JPG',
        )

    def test_matches_underscore_reference_to_hyphen_filename(self):
        self.add_image('posts/cover-image.webp')

        self.assertEqual(
            self.matcher.find_best_match('cover_image.webp'),
            'posts/cover-image.webp',
        )

    def test_uses_directory_context_for_duplicate_filenames(self):
        self.add_image('posts/first/cover_image.jpg')
        self.add_image('posts/second/cover_image.jpg')

        self.assertEqual(
            self.matcher.find_best_match('posts/second/cover-image'),
            'posts/second/cover_image.jpg',
        )

    def test_does_not_guess_when_separator_alias_is_ambiguous(self):
        self.add_image('first/cover_image.jpg')
        self.add_image('second/cover-image.jpg')

        self.assertIsNone(self.matcher.find_best_match('cover_-image'))

    def test_does_not_remove_missing_separator(self):
        self.add_image('re/firepunch/firepunch2.JPG')

        self.assertIsNone(self.matcher.find_best_match('firepunch-2'))


if __name__ == '__main__':
    unittest.main()
