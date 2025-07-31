/*
 * Import the autocomplete widget and its dependencies.
 * The current order of the imports is required.
 */

// All files require version, has to go first
import 'jquery-ui/ui/version';

// Shared files, used by menu and autocomplete, in alphabetical order
import 'jquery-ui/ui/keycode';
import 'jquery-ui/ui/position';
import 'jquery-ui/ui/unique-id';
import 'jquery-ui/ui/widget';

// Required by autocomplete, so has to go before
import 'jquery-ui/ui/widgets/menu';

// The autocomplete widget we use
import 'jquery-ui/ui/widgets/autocomplete';
